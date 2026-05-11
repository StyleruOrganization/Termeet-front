import { expect, test } from "@playwright/test";
import { calendarScope, layoutChrome } from "./helpers";

/**
 * Smoke routing/layout aligned with `src/app/routes/routes.tsx`.
 * Home differs between envs — keep assertions minimal (layout/title).
 */

test.describe("Smoke", () => {
  test.describe("Routes and layout", () => {
    test("home responds OK and shows shared chrome", async ({ page }) => {
      const response = await page.goto("/");
      expect(response?.ok()).toBeTruthy();

      await expect(page).toHaveTitle(/termeet/i);
      await expect(layoutChrome(page).first()).toBeVisible({ timeout: 15_000 });
    });

    test("/create shows form and disabled submit until filled", async ({ page }) => {
      await page.goto("/create");

      await expect(page.getByRole("heading", { level: 1, name: /Создайте встречу/ })).toBeVisible({
        timeout: 15_000,
      });

      await expect(page.getByTestId("meeting-form")).toBeVisible();
      await expect(calendarScope(page)).toBeVisible();

      const submitMeet = page.getByTestId("create-meet");
      await expect(submitMeet).toBeVisible();
      await expect(submitMeet).toBeDisabled();
    });

    test("unknown route shows placeholder and navigates to /create", async ({ page }) => {
      await page.goto("/e2e-unknown-route-smoke");

      await expect(
        page.getByRole("heading", {
          level: 1,
          name: "Мы не нашли страницу, которую ты ищешь",
        }),
      ).toBeVisible();

      await page.getByRole("button", { name: "Вернуться к созданию встречи" }).click();
      await expect(page).toHaveURL("/create");
    });

    test("header logo navigates home from create page", async ({ page }) => {
      await page.goto("/create");
      await page
        .getByRole("button", { name: /termeet/i })
        .first()
        .click();

      await expect(page).toHaveURL("/");
      await expect(layoutChrome(page).first()).toBeVisible({ timeout: 15_000 });
    });
  });
});
