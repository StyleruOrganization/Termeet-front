import { expect, test, type Page } from "@playwright/test";
import {
  E2E_MOCK_MEET_HASH,
  MEET_PATH_REGEX_LOOSE,
  calendarScope,
  clickSelectableCalendarDay,
  e2eUsesRemoteBackend,
} from "../helpers";

/**
 * `/create` E2E. Locally some scenarios mock API; with PLAYWRIGHT_BASE_URL submits hit real backend.
 * Describe/test titles are English; UI assertions keep Russian copy where needed.
 */

async function gotoCreateMeet(page: Page) {
  await page.goto("/create");
  await expect(page.getByRole("heading", { level: 1, name: /Создайте встречу/ })).toBeVisible({
    timeout: 15_000,
  });
}

async function fillMinimalValidMeet(page: Page, title = "E2E встреча") {
  await page.getByLabel("Название встречи").fill(title);
  await clickSelectableCalendarDay(page);
}

function mockCreateMeetApiSuccess(page: Page) {
  return page.route("**/api/meet/create", async route => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        name: "E2E meeting",
        description: null,
        link: null,
        duration: "1 час",
        dataRange: [["2026-06-15T07:00:00.000Z", "2026-06-15T08:00:00.000Z"]],
        hash: E2E_MOCK_MEET_HASH,
        slots: [],
      }),
    });
  });
}

function mockCreateMeetApiError(page: Page, status = 500) {
  return page.route("**/api/meet/create", route =>
    route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ message: "fail" }),
    }),
  );
}

test.describe("Create meet page", () => {
  test.describe("Hints and empty state", () => {
    test.beforeEach(async ({ page }) => {
      await gotoCreateMeet(page);
    });

    test("shows title suggestion when title is empty", async ({ page }) => {
      await expect(page.getByLabel("Название встречи")).toHaveValue("");
      await expect(page.getByText("Укажите название встречи")).toBeVisible();
    });

    test("hides title suggestion once title has text", async ({ page }) => {
      await page.getByLabel("Название встречи").fill("Синк");
      await expect(page.getByText("Укажите название встречи")).toHaveCount(0);
    });

    test("shows description hint when description is empty", async ({ page }) => {
      await expect(page.getByLabel("Описание встречи")).toHaveValue("");
      await expect(page.getByText("Максимальное количество символов — 400.")).toBeVisible();
    });

    test("calendar shows hint to pick at least one day until a date is chosen", async ({ page }) => {
      await expect(calendarScope(page).getByText("Выберите минимум один день")).toBeVisible();
      await clickSelectableCalendarDay(page);
      await expect(calendarScope(page).getByText("Выберите минимум один день")).toHaveCount(0);
    });

    test("submit is disabled on initial load", async ({ page }) => {
      await expect(page.getByTestId("create-meet")).toBeDisabled();
    });
  });

  test.describe("Field validation", () => {
    test.beforeEach(async ({ page }) => {
      await gotoCreateMeet(page);
    });

    test("title exceeds 128 characters shows error on blur", async ({ page }) => {
      const longTitle = "а".repeat(129);
      const titleInput = page.getByLabel("Название встречи");
      await titleInput.fill(longTitle);
      await titleInput.blur();

      await expect(page.getByText("Название не должно превышать 128 символов")).toBeVisible();
      await expect(page.getByTestId("create-meet")).toBeDisabled();
    });

    test("description exceeds 400 characters shows error on blur", async ({ page }) => {
      const area = page.getByLabel("Описание встречи");
      await area.fill("б".repeat(401));
      await area.blur();

      await expect(page.getByText("Описание не должно превышать 400 символов")).toBeVisible();
      await expect(page.getByTestId("create-meet")).toBeDisabled();
    });

    test("invalid link shows error and clears after valid URL on blur", async ({ page }) => {
      const linkInput = page.getByLabel("Ссылка на встречу");
      await linkInput.fill("bad");
      await linkInput.blur();
      await expect(page.getByText("Введите корректную ссылку (http:// или https://)")).toBeVisible();

      await linkInput.fill("https://telemost.yandex.ru/j/123");
      await linkInput.blur();
      await expect(page.getByText("Введите корректную ссылку (http:// или https://)")).toHaveCount(0);
    });

    test("link longer than 128 chars shows length error", async ({ page }) => {
      const linkInput = page.getByLabel("Ссылка на встречу");
      await linkInput.fill(`https://example.com/${"c".repeat(130)}`);
      await linkInput.blur();

      await expect(page.getByText("Размер ссылки не должен превышать 128 символов")).toBeVisible();
      await expect(page.getByTestId("create-meet")).toBeDisabled();
    });
  });

  test.describe("Calendar and submit", () => {
    test.beforeEach(async ({ page }) => {
      await gotoCreateMeet(page);
    });

    test("submit stays disabled until title and at least one calendar day", async ({ page }) => {
      const submit = page.getByTestId("create-meet");
      await page.getByLabel("Название встречи").fill("Планёрка");
      await expect(submit).toBeDisabled();

      await clickSelectableCalendarDay(page);
      await expect(submit).toBeEnabled();
    });

    test("deselecting the chosen day disables submit again", async ({ page }) => {
      await fillMinimalValidMeet(page);
      const submit = page.getByTestId("create-meet");
      await expect(submit).toBeEnabled();

      await clickSelectableCalendarDay(page);
      await expect(submit).toBeDisabled();
    });
  });

  test.describe("Time and duration", () => {
    test.beforeEach(async ({ page }) => {
      await gotoCreateMeet(page);
    });

    test("can pick another start time from dropdown", async ({ page }) => {
      await page.locator("#timeStart").click();
      await page.getByTestId("select-option-timeStart").filter({ hasText: "11 : 00" }).click();

      await expect(page.locator("#timeStart")).toHaveValue("11 : 00");
    });

    test("narrow time window hides overly long duration options", async ({ page }) => {
      await page.locator("#timeStart").click();
      await page.getByTestId("select-option-timeStart").filter({ hasText: "18 : 00" }).click();

      await page.locator("#timeEnd").click();
      await page.getByTestId("select-option-timeEnd").filter({ hasText: "19 : 00" }).click();

      await page.locator("#timeDuration").click();
      const dropdown = page.getByTestId("meeting-form");
      await expect(dropdown.getByRole("button", { name: "2 часа" })).toHaveCount(0);
      await expect(dropdown.getByRole("button", { name: "30 мин" })).toBeVisible();
    });

    test("can select duration when option is valid", async ({ page }) => {
      await page.locator("#timeDuration").click();
      await page.getByTestId("select-option-timeDuration").filter({ hasText: "1 час" }).click();
      await expect(page.locator("#timeDuration")).toHaveValue("1 час");
    });
  });

  test.describe("Submit and API", () => {
    test("successful submit navigates to meet page", async ({ page }) => {
      const uniqueTitle = `E2E playwright ${Date.now()}`;

      if (e2eUsesRemoteBackend()) {
        await gotoCreateMeet(page);
        await fillMinimalValidMeet(page, uniqueTitle);
        await page.getByTestId("create-meet").click();

        await expect(page).toHaveURL(MEET_PATH_REGEX_LOOSE, { timeout: 60_000 });
        await expect(page.getByText("Встреча успешно создана")).toBeVisible({ timeout: 20_000 });
        return;
      }

      await mockCreateMeetApiSuccess(page);
      await gotoCreateMeet(page);
      await fillMinimalValidMeet(page, "Тестовая встреча");

      await page.getByTestId("create-meet").click();

      await expect(page).toHaveURL(`/meet/${E2E_MOCK_MEET_HASH}`, { timeout: 15_000 });
      await expect(page.getByText("Встреча успешно создана")).toBeVisible();
    });

    test("posts trimmed title and optional link in JSON body", async ({ page }) => {
      let body: Record<string, unknown> | null = null;
      const paddedTitle = `  Имя-с-${Date.now()}  `;

      await page.route("**/api/meet/create", async route => {
        if (route.request().method() !== "POST") {
          await route.continue();
          return;
        }
        body = route.request().postDataJSON() as Record<string, unknown>;

        if (e2eUsesRemoteBackend()) {
          await route.continue();
        } else {
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              name: "E2E meeting",
              description: null,
              link: null,
              duration: null,
              dataRange: [["2026-06-15T07:00:00.000Z", "2026-06-15T08:00:00.000Z"]],
              hash: E2E_MOCK_MEET_HASH,
              slots: [],
            }),
          });
        }
      });

      await gotoCreateMeet(page);
      await page.getByLabel("Название встречи").fill(paddedTitle);
      await clickSelectableCalendarDay(page);
      const meetingLink = e2eUsesRemoteBackend()
        ? "https://telemost.yandex.ru/j/e2e-autotest"
        : "https://meet.example/room";
      await page.getByLabel("Ссылка на встречу").fill(meetingLink);

      await page.getByTestId("create-meet").click();

      await expect(page).toHaveURL(
        e2eUsesRemoteBackend() ? MEET_PATH_REGEX_LOOSE : new RegExp(`/meet/${E2E_MOCK_MEET_HASH}`),
        { timeout: 60_000 },
      );

      expect(body).not.toBeNull();
      expect(body!.name).toBe(paddedTitle.trim());
      expect(body!.link).toBe(meetingLink);
      expect(Array.isArray(body!.dataRange)).toBe(true);
    });

    test("API error shows toast and stays on create page", async ({ page }) => {
      await mockCreateMeetApiError(page);
      await gotoCreateMeet(page);
      await fillMinimalValidMeet(page);

      await page.getByTestId("create-meet").click();

      await expect(page.getByText("Ошибка при создании встречи")).toBeVisible({ timeout: 15_000 });
      await expect(page).toHaveURL(/\/create$/);
    });
  });
});
