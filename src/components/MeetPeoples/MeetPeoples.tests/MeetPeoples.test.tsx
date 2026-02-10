import { test, expect } from "@playwright/experimental-ct-react";
import { MeetPeoplesStory } from "./MeetPeoples.story";

test.describe("MeetPeoples", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<MeetPeoplesStory />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});
