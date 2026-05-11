import { expect, test } from "@playwright/experimental-ct-react";
import { ModalWrapperHarnessCt } from "./ModalWrapperHarness.ct";

test.describe("ModalWrapper (CT screenshots)", () => {
  test("open modal (short content)", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(<ModalWrapperHarnessCt contentVariant='short' initialOpen />);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(dialog).toHaveScreenshot({ animations: "disabled" });
  });

  test("open modal (long content)", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(<ModalWrapperHarnessCt contentVariant='long' initialOpen />);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 15_000 });
    await expect(dialog).toHaveScreenshot({ animations: "disabled" });
  });
});
