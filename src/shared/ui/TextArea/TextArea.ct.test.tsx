import { expect, test } from "@playwright/experimental-ct-react";
import { TextArea } from "./TextArea";

test.describe("TextArea (CT screenshots)", () => {
  test("empty with suggestion", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <div style={{ padding: 16, background: "var(--fill-bg)", width: 520 }}>
        <TextArea
          name='description'
          label='Описание встречи'
          placeholder='Тут можно написать, о чем будет встреча'
          value=''
          suggestMessage='Максимальное количество символов — 400.'
        />
      </div>,
    );

    await expect(page.getByText("Максимальное количество символов — 400.")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("body")).toHaveScreenshot({ animations: "disabled" });
  });

  test("error state", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <div style={{ padding: 16, background: "var(--fill-bg)", width: 520 }}>
        <TextArea
          name='description'
          label='Описание встречи'
          placeholder='Тут можно написать, о чем будет встреча'
          value={"б".repeat(401)}
          error='Описание не должно превышать 400 символов'
        />
      </div>,
    );

    await expect(page.getByText("Описание не должно превышать 400 символов")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("body")).toHaveScreenshot({ animations: "disabled" });
  });
});
