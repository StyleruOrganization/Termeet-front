import { test, expect } from "@playwright/experimental-ct-react";
import { MeetModalStory } from "./MeetModal.story";

test.describe("MeetModal", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<MeetModalStory />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});
