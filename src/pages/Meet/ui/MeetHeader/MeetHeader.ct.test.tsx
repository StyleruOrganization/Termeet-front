import { expect, test } from "@playwright/experimental-ct-react";
import { MeetHeaderHarnessCt } from "./MeetHeaderHarness.ct";

const CT_MEET_HASH = "ct-meet-hash";

test.describe("MeetHeader (CT screenshots)", () => {
  test("collapsed (default)", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <MeetHeaderHarnessCt
        meetHash={CT_MEET_HASH}
        query='foo=1'
        props={{
          name: "Тестовая встреча",
          duration: "30 мин",
          description: "Описание встречи для скриншота",
          link: "https://example.com/room",
        }}
      />,
    );

    const header = page.getByTestId("meet-header");
    await expect(header).toBeVisible({ timeout: 15_000 });
    await expect(header).toHaveScreenshot({ animations: "disabled" });
  });

  test("expanded after click (desktop)", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <MeetHeaderHarnessCt
        meetHash={CT_MEET_HASH}
        props={{
          name: "Тестовая встреча",
          duration: "30 мин",
          description: "Описание встречи для скриншота",
          link: "https://example.com/room",
        }}
      />,
    );

    const header = page.getByTestId("meet-header");
    await expect(header).toBeVisible({ timeout: 15_000 });

    await page.getByTestId("meet-header-expand-desc").click();
    await expect(header.getByText("Описание встречи для скриншота")).toBeVisible({ timeout: 15_000 });

    await expect(header).toHaveScreenshot({ animations: "disabled" });
  });
});
