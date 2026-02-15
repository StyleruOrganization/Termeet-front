import { test, expect } from "@playwright/experimental-ct-react";
import { MeetPageStory } from "./MeetPage.story";

test.describe("MeetPage", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<MeetPageStory />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});
