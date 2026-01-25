import { test, expect } from "@playwright/experimental-ct-react";
import { MeetingFormWithForm } from "./MeetingForm.story";

test.describe("MeetingForm Component", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<MeetingFormWithForm />);

    await expect(component).toBeVisible();
    await expect(component.locator("[data-test-id='meeting-form']")).toBeVisible();
    await expect(component.locator("input[name='title']")).toBeVisible();
    await expect(component.locator("textarea[name='description']")).toBeVisible();
    await expect(component.locator("input[name='link']")).toBeVisible();

    await expect(component).toHaveScreenshot();
  });

  test("with filled values", async ({ mount }) => {
    const component = await mount(<MeetingFormWithForm />);

    // Заполняем поля формы
    await component.locator("input[name='title']").fill("Тестовая встреча");
    await component.locator("textarea[name='description']").fill("Описание тестовой встречи");
    await component.locator("input[name='link']").fill("https://example.com/meeting");

    // Открываем dropdown для выбора времени начала
    const startToggle = component.locator("[data-test-id='select-toggle-time.start']");
    await startToggle.click();

    // Выбираем первое значение времени начала
    const firstStartOption = component.locator("[data-test-id='select-option-time.start']").first();
    await firstStartOption.click();

    // Открываем dropdown для выбора времени окончания
    const endToggle = component.locator("[data-test-id='select-toggle-time.end']");
    await endToggle.click();

    // Выбираем второе значение времени окончания
    const secondEndOption = component.locator("[data-test-id='select-option-time.end']").nth(1);
    await secondEndOption.click();

    await expect(component).toHaveScreenshot("meeting-form-with-values.png");
  });
});
