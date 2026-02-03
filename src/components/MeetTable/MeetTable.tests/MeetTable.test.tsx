import { test, expect } from "@playwright/experimental-ct-react";
import { MeetTableStory } from "./MeetTable.story";

test.describe("MeetTable", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<MeetTableStory />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});
