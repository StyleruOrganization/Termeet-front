import { expect, test, type Page } from "@playwright/test";

/**
 * Visual regression for `/create`.
 * Baselines live under `tests/e2e/screenshots/` (see `snapshotPathTemplate` in playwright.config).
 * Only `chromium` desktop project: same browserName is used by mobile-chrome — filter by project name.
 *
 * Update snapshots after intentional UI changes:
 *   NODE_ENV=test pnpm exec playwright test tests/e2e/visual/create-meet.visual.test.ts --project=chromium --update-snapshots
 */

async function gotoCreateMeetForScreenshot(page: Page) {
  await page.goto("/create", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { level: 1, name: /Создайте встречу/ })).toBeVisible({
    timeout: 15_000,
  });
  await page.evaluate(() => document.fonts.ready);
}

test.describe("Create meet page screenshots", () => {
  test("meeting form initial layout", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Visual baselines are maintained only for the chromium desktop project.",
    );
    await gotoCreateMeetForScreenshot(page);
    const form = page.getByTestId("meeting-form");
    await expect(form).toBeVisible();

    await expect(form).toHaveScreenshot("meeting-form-initial.png", {
      animations: "disabled",
      threshold: 0.2,
    });
  });

  test("viewport below layout chrome", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Visual baselines are maintained only for the chromium desktop project.",
    );
    await gotoCreateMeetForScreenshot(page);

    await expect(page).toHaveScreenshot("create-meet-viewport.png", {
      animations: "disabled",
      fullPage: false,
      threshold: 0.2,
    });
  });
});
