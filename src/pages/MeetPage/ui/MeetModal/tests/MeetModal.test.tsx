import { test, expect } from "@playwright/experimental-ct-react";
import { MeetModalStory } from "./MeetModal.story";

test.describe("MeetModal", () => {
  test("default state", async ({ mount, page }) => {
    const component = await mount(<MeetModalStory />);

    // Animationa
    await page.waitForTimeout(300);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});
