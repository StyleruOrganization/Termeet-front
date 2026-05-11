import { expect, test } from "@playwright/experimental-ct-react";
import { ToastHarness } from "./ToastHarness.ct";

test.describe("ToastContainer (CT screenshots)", () => {
  test("success toast", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <ToastHarness toasts={[{ id: "ok", type: "success", message: "Успех!", duration: 10_000, isExiting: false }]} />,
    );

    const root = page.locator("body");
    await expect(page.getByText("Успех!", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(root).toHaveScreenshot({ animations: "disabled" });
  });

  test("wait toast", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <ToastHarness
        toasts={[{ id: "wait", type: "wait", message: "Загружаем…", duration: 10_000, isExiting: false }]}
      />,
    );

    const root = page.locator("body");
    await expect(page.getByText("Загружаем…", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(root).toHaveScreenshot({ animations: "disabled" });
  });

  test("multiple toasts stack", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <ToastHarness
        toasts={[
          { id: "a", type: "success", message: "Сохранено", duration: 10_000, isExiting: false },
          { id: "b", type: "error", message: "Ошибка", duration: 10_000, isExiting: false },
          { id: "c", type: "wait", message: "Обновляем…", duration: 10_000, isExiting: false },
        ]}
      />,
    );

    const root = page.locator("body");
    await expect(page.getByText("Сохранено", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Ошибка", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(root).toHaveScreenshot({ animations: "disabled" });
  });
});
