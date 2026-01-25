import { test } from "@playwright/test";

test.describe("Meeting Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });
});
