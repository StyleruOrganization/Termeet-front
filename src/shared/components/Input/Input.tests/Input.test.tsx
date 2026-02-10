import { test, expect } from "@playwright/experimental-ct-react";
import { InputStory } from "./Input.story";

test.describe("Input Component", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<InputStory />);

    await expect(component).toBeVisible();
    await expect(component.locator("input")).toBeVisible();
    await expect(component.locator("label")).toHaveText("Название встречи");

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });

  test("error state", async ({ mount }) => {
    const component = await mount(<InputStory error='Поле обязательно для заполнения' />);

    await expect(component).toBeVisible();
    await expect(component.locator("[data-test-id='error-field']")).toBeVisible();
    await expect(component.locator("[data-test-id='error-field'] span")).toHaveText("Поле обязательно для заполнения");

    await expect(component).toHaveScreenshot();
  });

  test("with value", async ({ mount }) => {
    const component = await mount(<InputStory />);

    const input = component.locator("input");
    await input.fill("Новая встреча");

    await expect(component).toHaveScreenshot();
  });
});
