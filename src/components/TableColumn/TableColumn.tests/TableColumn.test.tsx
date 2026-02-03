import { test, expect } from "@playwright/experimental-ct-react";
import { TableColumnStory } from "./TableColumn.story";

test.describe("TableColumn", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<TableColumnStory />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});
