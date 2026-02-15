import { test, expect } from "@playwright/experimental-ct-react";
import { CalendarWithForm } from "./Calendar.story";

test.describe("Calendar Component", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<CalendarWithForm />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });

  test("error state", async ({ mount }) => {
    const component = await mount(<CalendarWithForm error='Поле обязательно для заполнения' />);

    await expect(component).toBeVisible();
    await expect(component.locator("[data-test-id='error-field']")).toBeVisible();
    await expect(component.locator("[data-test-id='error-field'] span")).toHaveText("Поле обязательно для заполнения");

    await expect(component).toHaveScreenshot();
  });
});
