import { test, expect } from "@playwright/experimental-ct-react";
import { MeetHeaderStory } from "./MeetHeader.story";

test.describe("MeetHeader", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<MeetHeaderStory />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});
