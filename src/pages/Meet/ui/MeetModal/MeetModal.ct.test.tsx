import { expect, test } from "@playwright/experimental-ct-react";
import { MeetModalHarnessCt } from "./MeetModalHarness.ct";

const CT_MEET_HASH = "ct-meet-hash";

test.describe("MeetModal (CT screenshots)", () => {
  test("open modal (empty name)", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(<MeetModalHarnessCt meetHash={CT_MEET_HASH} users={["Пользователь Альфа"]} />);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Слоты заполнены!/)).toBeVisible();
    await expect(dialog).toHaveScreenshot({ animations: "disabled" });
  });

  test("duplicate username shows inline error", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(<MeetModalHarnessCt meetHash={CT_MEET_HASH} users={["Уже есть в списке"]} />);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 15_000 });

    await page.getByLabel("Как тебя зовут?").fill("Уже есть в списке");
    await expect(page.getByText("Пользователь с таким именем уже существует!")).toBeVisible({ timeout: 15_000 });

    await expect(dialog).toHaveScreenshot({ animations: "disabled" });
  });
});
