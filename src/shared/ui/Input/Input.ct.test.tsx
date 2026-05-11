import { expect, test } from "@playwright/experimental-ct-react";
import { Input } from "./Input";

test.describe("Input (CT screenshots)", () => {
  test("empty with suggestion", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <div style={{ padding: 16, background: "var(--fill-bg)", width: 520 }}>
        <Input
          name='title'
          label='Название встречи'
          placeholder='«Лютый синк»'
          value=''
          suggestMessage='Укажите название встречи'
        />
      </div>,
    );

    await expect(page.getByText("Укажите название встречи")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("body")).toHaveScreenshot({ animations: "disabled" });
  });

  test("error state", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <div style={{ padding: 16, background: "var(--fill-bg)", width: 520 }}>
        <Input
          name='title'
          label='Название встречи'
          placeholder='«Лютый синк»'
          value={"а".repeat(129)}
          error='Название не должно превышать 128 символов'
        />
      </div>,
    );

    await expect(page.getByText("Название не должно превышать 128 символов")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("body")).toHaveScreenshot({ animations: "disabled" });
  });
});
