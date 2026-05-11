import { expect, test, type Page, type Route } from "@playwright/test";
import { E2E_MOCK_MEET_HASH } from "../helpers";

/**
 * Integration-style tests: full page + mocked API via `page.route`.
 * Goal: verify UI wiring between Meet page blocks and API contracts without real backend.
 */

type MeetWire = {
  name: string;
  description?: string | null;
  link?: string | null;
  duration?: string | null;
  dataRange: [string, string][];
  hash: string;
  slots: { name: string; slots: [string, string][] }[];
};

function baseMeet(overrides: Partial<MeetWire> = {}): MeetWire {
  return {
    name: "Integration — meet page",
    description: "Описание встречи для интеграционного теста.",
    link: "https://example.com/room",
    duration: "1 час",
    dataRange: [["2030-06-15T08:00:00.000Z", "2030-06-15T10:00:00.000Z"]],
    hash: E2E_MOCK_MEET_HASH,
    slots: [],
    ...overrides,
  };
}

function installMeetApiMock(page: Page, body: MeetWire, patchSlotsHandler: (route: Route) => Promise<void>) {
  const hash = body.hash;
  return page.route("**/api/meet/**", async route => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const method = req.method();

    if (method === "GET" && path === `/api/meet/${hash}`) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
      return;
    }

    if (method === "PATCH" && path === `/api/meet/${hash}/slots`) {
      await patchSlotsHandler(route);
      return;
    }

    await route.continue();
  });
}

async function gotoMeet(page: Page, body: MeetWire) {
  await page.goto(`/meet/${body.hash}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(body.name, { exact: true }).first()).toBeVisible({ timeout: 25_000 });
}

async function selectFirstEnabledSlot(page: Page) {
  const cell = page.locator('[data-disabled-cell="false"][data-id^="20"]').first();
  await expect(cell).toBeVisible({ timeout: 15_000 });
  await cell.click();
}

function locAddTime(page: Page) {
  return page.getByRole("button", { name: "Добавить время" }).or(page.getByTestId("meet-add-time"));
}

function locSaveSlotsOpenModal(page: Page) {
  const row = page.locator('[class*="MeetInfo__ButtonsEdit"]').first();
  return row
    .getByTestId("meet-save-slots-open-modal")
    .or(row.getByRole("button", { name: "Сохранить выбранные слоты" }))
    .or(row.getByRole("button", { name: "Сохранить" }));
}

test.describe.serial("Integration: Meet page (mocked API)", () => {
  test("user can pick slots and submit name (PATCH mocked)", async ({ page }) => {
    const body = baseMeet();
    let patchBody: Record<string, unknown> | null = null;

    await installMeetApiMock(page, body, async route => {
      patchBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          name: (patchBody?.name as string) ?? "Тестовый пользователь",
          slots: (patchBody?.slots as unknown[]) ?? [],
        }),
      });
    });

    await gotoMeet(page, body);

    // enter edit mode, then select a slot and save
    await locAddTime(page).click();
    await selectFirstEnabledSlot(page);
    await locSaveSlotsOpenModal(page).click();

    const modal = page.getByRole("dialog").filter({ hasText: "Как тебя зовут?" });
    await expect(modal).toBeVisible({ timeout: 15_000 });

    const username = `Интеграция ${Date.now()}`;
    await page.getByLabel("Как тебя зовут?").fill(username);
    const submit = modal
      .getByTestId("meet-modal-submit-slots")
      .or(modal.getByRole("button", { name: "Сохранить слоты" }));
    await expect(submit).toBeEnabled({ timeout: 15_000 });
    await submit.click();

    await expect(page.getByText("Выбранные временные слоты успешно сохранены")).toBeVisible({ timeout: 20_000 });

    expect(patchBody).not.toBeNull();
    expect(patchBody!.name).toBe(username);
    expect(Array.isArray(patchBody!.slots)).toBe(true);
  });

  test("duplicate username disables submit and shows inline error", async ({ page }) => {
    const body = baseMeet({
      slots: [
        {
          name: "Уже есть",
          slots: [["2030-06-15T08:00:00.000Z", "2030-06-15T08:30:00.000Z"]],
        },
      ],
    });

    await installMeetApiMock(page, body, async route => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ name: "x", slots: [] }),
      });
    });
    await gotoMeet(page, body);

    await locAddTime(page).click();
    await selectFirstEnabledSlot(page);
    await locSaveSlotsOpenModal(page).click();

    await page.getByLabel("Как тебя зовут?").fill("Уже есть");
    await expect(page.getByText("Пользователь с таким именем уже существует!")).toBeVisible({ timeout: 15_000 });
    const modal = page.getByRole("dialog").filter({ hasText: "Как тебя зовут?" });
    const submit = modal
      .getByTestId("meet-modal-submit-slots")
      .or(modal.getByRole("button", { name: "Сохранить слоты" }));
    await expect(submit).toBeDisabled();
  });
});
