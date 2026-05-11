import { expect, test } from "@playwright/experimental-ct-react";
import { Toggle } from "./Toggle";

test.describe("Toggle (CT screenshots)", () => {
  test("default left selected", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <div style={{ padding: 16, background: "var(--fill-bg)" }}>
        <Toggle LeftLabel='По местному (UTC+3)' RightLabel='По Москве (UTC+3)' defaultActive='left' />
      </div>,
    );

    const root = page.locator('[class*="ToogleContainer"]').first();
    await expect(root).toBeVisible({ timeout: 15_000 });
    await expect(root).toHaveScreenshot({ animations: "disabled" });
  });

  test("default right selected", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <div style={{ padding: 16, background: "var(--fill-bg)" }}>
        <Toggle LeftLabel='По местному (UTC+3)' RightLabel='По Москве (UTC+3)' defaultActive='right' />
      </div>,
    );

    const root = page.locator('[class*="ToogleContainer"]').first();
    await expect(root).toBeVisible({ timeout: 15_000 });
    await expect(root).toHaveScreenshot({ animations: "disabled" });
  });
});
