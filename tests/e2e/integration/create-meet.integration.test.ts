import { expect, test, type Page } from "@playwright/test";
import { E2E_MOCK_MEET_HASH, MEET_PATH_REGEX_LOOSE, clickSelectableCalendarDay } from "../helpers";

/**
 * Integration-style tests: full page + mocked API via `page.route`.
 * Goal: verify Create Meet page wiring (form -> POST -> navigation + toast) without real backend.
 */

async function gotoCreateMeet(page: Page) {
  await page.goto("/create");
  await expect(page.getByRole("heading", { level: 1, name: /Создайте встречу/ })).toBeVisible({
    timeout: 25_000,
  });
}

function mockCreateMeetApi(page: Page, handler: (postBody: Record<string, unknown> | null) => unknown) {
  return page.route("**/api/meet/create", async route => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }

    const body = route.request().postDataJSON() as Record<string, unknown> | null;
    const response = handler(body);

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
}

test.describe.serial("Integration: Create meet page (mocked API)", () => {
  test("minimal valid submit navigates to meet page and shows success toast", async ({ page }) => {
    await mockCreateMeetApi(page, () => ({
      name: "Integration meeting",
      description: null,
      link: null,
      duration: "1 час",
      dataRange: [["2026-06-15T07:00:00.000Z", "2026-06-15T08:00:00.000Z"]],
      hash: E2E_MOCK_MEET_HASH,
      slots: [],
    }));

    await gotoCreateMeet(page);
    await page.getByLabel("Название встречи").fill("Интеграция — встреча");
    await clickSelectableCalendarDay(page);

    await expect(page.getByTestId("create-meet")).toBeEnabled();
    await page.getByTestId("create-meet").click();

    await expect(page).toHaveURL(MEET_PATH_REGEX_LOOSE, { timeout: 25_000 });
    await expect(page.getByText("Встреча успешно создана")).toBeVisible({ timeout: 20_000 });
  });

  test("POST body is trimmed and includes optional link", async ({ page }) => {
    let posted: Record<string, unknown> | null = null;
    await mockCreateMeetApi(page, body => {
      posted = body;
      return {
        name: "Integration meeting",
        description: null,
        link: null,
        duration: "1 час",
        dataRange: [["2026-06-15T07:00:00.000Z", "2026-06-15T08:00:00.000Z"]],
        hash: E2E_MOCK_MEET_HASH,
        slots: [],
      };
    });

    const paddedTitle = `  Название ${Date.now()}  `;
    const paddedDesc = "  Описание  ";
    const link = "https://meet.example/room";

    await gotoCreateMeet(page);
    await page.getByLabel("Название встречи").fill(paddedTitle);
    await page.getByLabel("Описание встречи").fill(paddedDesc);
    await page.getByLabel("Ссылка на встречу").fill(link);
    await clickSelectableCalendarDay(page);
    await page.getByTestId("create-meet").click();

    await expect(page).toHaveURL(new RegExp(`/meet/${E2E_MOCK_MEET_HASH}`), { timeout: 25_000 });

    expect(posted).not.toBeNull();
    expect(posted!.name).toBe(paddedTitle.trim());
    expect(posted!.description).toBe(paddedDesc.trim());
    expect(posted!.link).toBe(link);
    expect(Array.isArray(posted!.dataRange)).toBe(true);
  });
});
