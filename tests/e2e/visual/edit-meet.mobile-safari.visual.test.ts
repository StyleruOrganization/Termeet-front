import { expect, test, type Page } from "@playwright/test";
import { E2E_MOCK_MEET_HASH } from "../helpers";

/**
 * Visual regression for `/meet/edit/:hash` on iOS (mobile-safari / WebKit).
 *
 * Update snapshots:
 *   NODE_ENV=test pnpm exec playwright test tests/e2e/visual/edit-meet.mobile-safari.visual.test.ts --project=mobile-safari --update-snapshots
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
    name: "E2E — edit iOS screenshots",
    description: "Описание для iOS визуального теста редактирования.",
    link: "https://telemost.yandex.ru/j/e2e-edit-room",
    duration: "1 час",
    dataRange: [["2030-06-15T08:00:00.000Z", "2030-06-15T12:00:00.000Z"]],
    hash: E2E_MOCK_MEET_HASH,
    slots: [],
    ...overrides,
  };
}

function installMeetGetMock(page: Page, body: MeetWire) {
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

    await route.continue();
  });
}

async function gotoEditMeetForScreenshot(page: Page, body: MeetWire) {
  await page.goto(`/meet/edit/${body.hash}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: "Редактирование встречи" })).toBeVisible({
    timeout: 25_000,
  });
  await expect(page.getByLabel("Название встречи")).toHaveValue(body.name, { timeout: 15_000 });
  await page.evaluate(() => document.fonts.ready);
}

test.describe("Edit meet page iOS screenshots", () => {
  test("edit page viewport (iOS)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-safari", "Baselines are maintained only for mobile-safari.");

    const body = baseMeet();
    await installMeetGetMock(page, body);
    await gotoEditMeetForScreenshot(page, body);

    await expect(page).toHaveScreenshot("edit-meet-ios-viewport.png", {
      animations: "disabled",
      fullPage: false,
      threshold: 0.2,
    });
  });

  test("edit form block (iOS)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-safari", "Baselines are maintained only for mobile-safari.");

    const body = baseMeet();
    await installMeetGetMock(page, body);
    await gotoEditMeetForScreenshot(page, body);

    const form = page
      .locator("form")
      .filter({ has: page.getByRole("heading", { level: 1, name: "Редактирование встречи" }) });
    await expect(form).toBeVisible();

    await expect(form).toHaveScreenshot("edit-meet-form-ios.png", {
      animations: "disabled",
      threshold: 0.2,
    });
  });
});
