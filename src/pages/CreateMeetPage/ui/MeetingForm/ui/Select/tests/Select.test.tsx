import { test, expect } from "@playwright/experimental-ct-react";
import { SelectWithForm } from "./Select.story";

test.describe("Select Component", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<SelectWithForm />);

    await expect(component).toBeVisible();
    await expect(component.locator("input")).toBeVisible();
    await expect(component.locator("label")).toHaveText("Время начала");

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });

  test("error state", async ({ mount }) => {
    const component = await mount(<SelectWithForm error='Поле обязательно для заполнения' />);

    await expect(component).toBeVisible();
    await expect(component.locator("[data-test-id='error-field']")).toBeVisible();
    await expect(component.locator("[data-test-id='error-field'] span")).toHaveText("Поле обязательно для заполнения");

    await expect(component).toHaveScreenshot();
  });

  test("with selected value", async ({ mount }) => {
    const component = await mount(<SelectWithForm />);

    // Открываем dropdown
    const toggleButton = component.locator("[data-test-id='select-toggle-time.start']");
    await toggleButton.click();

    // Выбираем первое значение
    const firstOption = component.locator("[data-test-id='select-option-time.start']").first();
    await firstOption.click();

    await expect(component).toHaveScreenshot();
  });

  // test("dropdown open state", async ({ mount }) => {
  //   const component = await mount(<SelectWithForm />);

  //   // Открываем dropdown
  //   const toggleButton = component.locator(".TimeSelect__Toggle");
  //   await toggleButton.click();

  //   // Проверяем, что dropdown открыт
  //   await expect(component.locator(".TimeSelect__Dropdown")).toBeVisible();

  //   await expect(component).toHaveScreenshot();
  // });
});
