import { expect, test } from "@playwright/test";

/**
 * Visual regression for 404 (Stub) page.
 *
 * Update snapshots:
 *   NODE_ENV=test pnpm exec playwright test tests/e2e/visual/stub.visual.test.ts --project=chromium --update-snapshots
 */

test.describe("Stub (404) screenshots", () => {
  test("unknown route placeholder", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "Visual baselines are maintained only for the chromium desktop project.",
    );

    await page.goto("/e2e-unknown-route-visual", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Мы не нашли страницу, которую ты ищешь",
      }),
    ).toBeVisible({ timeout: 15_000 });
    await page.evaluate(() => document.fonts.ready);

    await expect(page).toHaveScreenshot("stub-404-viewport.png", {
      animations: "disabled",
      fullPage: false,
      threshold: 0.2,
    });
  });
});
