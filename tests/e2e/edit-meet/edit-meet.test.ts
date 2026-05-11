import { expect, test, type Page, type Route } from "@playwright/test";
import { E2E_MOCK_MEET_HASH } from "../helpers";

/**
 * `/meet/edit/:hash`. GET + PATCH (metadata) mocked — same pattern as meet page E2E.
 * Describe/test titles are English; UI copy stays Russian in assertions.
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

function installEditMeetApiMock(page: Page, body: MeetWire, patchMeetHandler?: (route: Route) => Promise<void>) {
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
      if (patchMeetHandler) {
        await patchMeetHandler(route);
      } else {
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      }
      return;
    }

    await route.continue();
  });
}

async function gotoEditMeet(page: Page, body: MeetWire, query?: Record<string, string>) {
  const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
  await page.goto(`/meet/edit/${body.hash}${qs}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "Редактирование встречи" })).toBeVisible({
    timeout: 25_000,
  });
  await expect(page.getByLabel("Название встречи")).toHaveValue(body.name, { timeout: 15_000 });
}

function baseMeet(overrides: Partial<MeetWire> = {}): MeetWire {
  return {
    name: "E2E — редактирование встречи",
    description: "Текст описания на странице редактирования.",
    link: "https://telemost.yandex.ru/j/e2e-edit-room",
    duration: "1 час",
    dataRange: [["2030-06-15T08:00:00.000Z", "2030-06-15T12:00:00.000Z"]],
    hash: E2E_MOCK_MEET_HASH,
    slots: [],
    ...overrides,
  };
}

function locEditForm(page: Page) {
  return page.locator("form").filter({ has: page.getByRole("heading", { level: 1, name: "Редактирование встречи" }) });
}

function locSaveEdit(page: Page) {
  return locEditForm(page).getByRole("button", { name: "Сохранить" });
}

function locCancelEdit(page: Page) {
  return locEditForm(page).getByRole("button", { name: "Отменить" });
}

test.describe.serial("Edit meet page", () => {
  test.describe("Form load and actions", () => {
    test("renders heading, prefilled fields, and disables save until a change", async ({ page }) => {
      const body = baseMeet();
      await installEditMeetApiMock(page, body);
      await gotoEditMeet(page, body);

      await expect(page.getByLabel("Описание встречи")).toHaveValue(body.description ?? "");
      await expect(page.getByLabel("Ссылка на встречу")).toHaveValue(body.link ?? "");
      await expect(locSaveEdit(page)).toBeDisabled();

      await page.getByLabel("Название встречи").fill(`${body.name} (изменено)`);
      await expect(locSaveEdit(page)).toBeEnabled();
    });

    test("cancel navigates back to meet page without PATCH", async ({ page }) => {
      let patchCount = 0;
      await installEditMeetApiMock(page, baseMeet(), async route => {
        patchCount += 1;
        await route.fulfill({ status: 200, body: "{}" });
      });
      await gotoEditMeet(page, baseMeet());

      await page.getByLabel("Название встречи").fill("Любое изменение");
      await locCancelEdit(page).click();

      await expect(page).toHaveURL(new RegExp(`/meet/${E2E_MOCK_MEET_HASH}(\\?|$)`));
      expect(patchCount).toBe(0);
    });
  });

  test.describe("Validation", () => {
    test.beforeEach(async ({ page }) => {
      await installEditMeetApiMock(page, baseMeet());
      await gotoEditMeet(page, baseMeet());
    });

    test("empty name on blur shows error and disables save", async ({ page }) => {
      const title = page.getByLabel("Название встречи");
      await title.fill("");
      await title.blur();
      await expect(page.getByText("Название встречи обязательно")).toBeVisible();
      await expect(locSaveEdit(page)).toBeDisabled();
    });

    test("description over 400 chars on blur shows error", async ({ page }) => {
      const area = page.getByLabel("Описание встречи");
      await area.fill("б".repeat(401));
      await area.blur();
      await expect(page.getByText("Описание не должно превышать 400 символов")).toBeVisible();
      await expect(locSaveEdit(page)).toBeDisabled();
    });

    test("invalid link on blur shows error", async ({ page }) => {
      const linkInput = page.getByLabel("Ссылка на встречу");
      await linkInput.fill("not-a-url");
      await linkInput.blur();
      await expect(page.getByText("Введите корректную ссылку (http:// или https://)")).toBeVisible();
      await expect(locSaveEdit(page)).toBeDisabled();
    });
  });

  test.describe("Patch meet metadata", () => {
    test("successful save sends PATCH body and navigates to meet with success toast", async ({ page }) => {
      let patchBody: Record<string, unknown> | null = null;
      const body = baseMeet();
      await installEditMeetApiMock(page, body, async route => {
        patchBody = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      });
      await gotoEditMeet(page, body);

      const newTitle = `Обновлённое имя ${Date.now()}`;
      await page.getByLabel("Название встречи").fill(newTitle);
      await locSaveEdit(page).click();

      await expect(page).toHaveURL(new RegExp(`/meet/${E2E_MOCK_MEET_HASH}(\\?|$)`), { timeout: 20_000 });
      await expect(page.getByText("Информация о встрече успешно обновлена!")).toBeVisible({
        timeout: 20_000,
      });

      expect(patchBody).not.toBeNull();
      expect(patchBody!.name).toBe(newTitle);
      expect(patchBody!.description).toBe((body.description ?? "").trim());
      expect(patchBody!.link).toBe((body.link ?? "").trim());
      expect(Array.isArray(patchBody!.dataRange)).toBe(true);
    });

    test("PATCH error shows toast and stays on edit page", async ({ page }) => {
      await installEditMeetApiMock(page, baseMeet(), async route => {
        await route.fulfill({ status: 500, contentType: "application/json", body: '{"message":"fail"}' });
      });
      await gotoEditMeet(page, baseMeet());

      await page.getByLabel("Название встречи").fill(`${baseMeet().name} правка`);
      await locSaveEdit(page).click();

      await expect(page.getByText("Не удалось обновить информацию о встрече")).toBeVisible({
        timeout: 20_000,
      });
      await expect(page).toHaveURL(new RegExp(`/meet/edit/${E2E_MOCK_MEET_HASH}`));
    });
  });
});
