import { test, expect } from "@playwright/experimental-ct-react";
import { mockUsers } from "./MeetPeoples.const";
import { MeetPeoplesStory } from "./MeetPeoples.story";

test.describe("MeetPeoples", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<MeetPeoplesStory hoveredUsers={[]} />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });

  test("state with active person", async ({ mount }) => {
    const component = await mount(<MeetPeoplesStory hoveredUsers={[mockUsers[1], mockUsers[3]]} />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});
