import { expect, test, type Page, type Route } from "@playwright/test";
import { E2E_MOCK_MEET_HASH } from "../helpers";

/**
 * Integration-style tests: full page + mocked API via `page.route`.
 * Goal: verify Edit Meet page wiring (prefill -> PATCH -> navigation + toasts) without real backend.
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
    name: "Integration — edit meet",
    description: "Описание для интеграционного теста",
    link: "https://example.com/room",
    duration: "1 час",
    dataRange: [["2030-06-15T08:00:00.000Z", "2030-06-15T10:00:00.000Z"]],
    hash: E2E_MOCK_MEET_HASH,
    slots: [],
    ...overrides,
  };
}

function installEditMeetApiMock(page: Page, body: MeetWire, patchMeetHandler: (route: Route) => Promise<void>) {
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

    if (method === "PATCH" && path === `/api/meet/${hash}`) {
      await patchMeetHandler(route);
      return;
    }

    await route.continue();
  });
}

async function gotoEditMeet(page: Page, body: MeetWire) {
  await page.goto(`/meet/edit/${body.hash}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "Редактирование встречи" })).toBeVisible({
    timeout: 25_000,
  });
  await expect(page.getByLabel("Название встречи")).toHaveValue(body.name, { timeout: 15_000 });
}

test.describe.serial("Integration: Edit meet page (mocked API)", () => {
  test("prefills fields, PATCHes data, then navigates back with success toast", async ({ page }) => {
    const body = baseMeet();
    let patchBody: Record<string, unknown> | null = null;

    await installEditMeetApiMock(page, body, async route => {
      patchBody = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });

    await gotoEditMeet(page, body);

    const newTitle = `Интеграция edit ${Date.now()}`;
    await page.getByLabel("Название встречи").fill(newTitle);
    await page.getByRole("button", { name: "Сохранить" }).click();

    await expect(page).toHaveURL(new RegExp(`/meet/${body.hash}(\\?|$)`), { timeout: 25_000 });
    await expect(page.getByText("Информация о встрече успешно обновлена!")).toBeVisible({ timeout: 20_000 });

    expect(patchBody).not.toBeNull();
    expect(patchBody!.name).toBe(newTitle);
    expect(patchBody!.description).toBe((body.description ?? "").trim());
    expect(patchBody!.link).toBe((body.link ?? "").trim());
    expect(Array.isArray(patchBody!.dataRange)).toBe(true);
  });

  test("PATCH error shows toast and stays on edit page", async ({ page }) => {
    const body = baseMeet();

    await installEditMeetApiMock(page, body, async route => {
      await route.fulfill({ status: 500, contentType: "application/json", body: '{"message":"fail"}' });
    });

    await gotoEditMeet(page, body);

    await page.getByLabel("Название встречи").fill(`${body.name} правка`);
    await page.getByRole("button", { name: "Сохранить" }).click();

    await expect(page.getByText("Не удалось обновить информацию о встрече")).toBeVisible({ timeout: 20_000 });
    await expect(page).toHaveURL(new RegExp(`/meet/edit/${body.hash}(\\?|$)`));
  });
});
