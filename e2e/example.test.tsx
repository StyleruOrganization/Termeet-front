import { test, expect } from "@playwright/test";

test.describe("Meeting Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("check", () => {
    expect(true).toBeTruthy();
  });
});
