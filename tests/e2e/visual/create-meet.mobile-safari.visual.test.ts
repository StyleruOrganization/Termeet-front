import { expect, test, type Page } from "@playwright/test";

/**
 * Visual regression for `/create` on iOS (mobile-safari / WebKit).
 *
 * Update snapshots:
 *   NODE_ENV=test pnpm exec playwright test tests/e2e/visual/create-meet.mobile-safari.visual.test.ts --project=mobile-safari --update-snapshots
 */

async function gotoCreateMeetForScreenshot(page: Page) {
  await page.goto("/create", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: /Создайте встречу/ })).toBeVisible({
    timeout: 15_000,
  });
  await page.evaluate(() => document.fonts.ready);
}

test.describe("Create meet page iOS screenshots", () => {
  test("create page viewport (iOS)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-safari", "Baselines are maintained only for mobile-safari.");

    await gotoCreateMeetForScreenshot(page);

    await expect(page).toHaveScreenshot("create-meet-ios-viewport.png", {
      animations: "disabled",
      fullPage: false,
      threshold: 0.2,
    });
  });

  test("meeting form block (iOS)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-safari", "Baselines are maintained only for mobile-safari.");

    await gotoCreateMeetForScreenshot(page);
    const form = page.getByTestId("meeting-form");
    await expect(form).toBeVisible();

    await expect(form).toHaveScreenshot("meeting-form-ios.png", {
      animations: "disabled",
      threshold: 0.2,
    });
  });
});
