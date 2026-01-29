import { test, expect } from "@playwright/experimental-ct-react";
import { <FTName | capitalize>Story } from "./<FTName | capitalize>.story";

test.describe("<FTName | capitalize>", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<<FTName | capitalize>Story />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});