import { test, expect } from "@playwright/experimental-ct-react";
import { HeaderStory } from "./Header.story";

test.describe("Header", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<HeaderStory />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});
