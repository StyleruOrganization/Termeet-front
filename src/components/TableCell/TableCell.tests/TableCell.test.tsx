import { test, expect } from "@playwright/experimental-ct-react";
import { TableCellStory } from "./TableCell.story";

test.describe("TableCell", () => {
  test("default state", async ({ mount }) => {
    const component = await mount(<TableCellStory />);

    await expect(component).toBeVisible();

    // Скриншот компонента
    await expect(component).toHaveScreenshot();
  });
});
