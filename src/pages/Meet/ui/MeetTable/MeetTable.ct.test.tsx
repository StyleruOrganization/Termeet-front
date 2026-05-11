import { expect, test } from "@playwright/experimental-ct-react";
import { MeetTableHarnessCt } from "./MeetTableHarness.ct";

test.describe("MeetTable (CT screenshots)", () => {
  test("table layout (1 day)", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    page.on("pageerror", err => {
      throw err;
    });

    await mount(<MeetTableHarnessCt />);

    const table = page.locator('[data-test-id="meet-table"]');
    await expect(table).toBeVisible({ timeout: 15_000 });
    await expect(table).toHaveScreenshot({ animations: "disabled" });
  });

  test("table layout (2 days, split ranges)", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    page.on("pageerror", err => {
      throw err;
    });

    const dayA = "2030-06-15";
    const dayB = "2030-06-16";

    // Table timeRanges show two periods; per-day ranges intentionally differ to trigger fake before/after cells.
    const tableTimeRanges: [string, string][] = [
      ["10:00", "12:00"],
      ["13:00", "14:00"],
    ];

    await mount(<MeetTableHarnessCt meetingDays={[dayA, dayB]} tableTimeRanges={tableTimeRanges} />);

    const table = page.locator('[data-test-id="meet-table"]');
    await expect(table).toBeVisible({ timeout: 15_000 });
    await expect(table).toHaveScreenshot({ animations: "disabled" });
  });
});
