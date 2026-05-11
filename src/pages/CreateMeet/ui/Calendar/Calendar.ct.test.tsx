import { expect, test } from "@playwright/experimental-ct-react";
import { Calendar as ReactCalendar } from "react-calendar";
import { Calendar } from "./Calendar";
import { useCreateMeetStore } from "../../model/useCreateMeetStore";

const FIXED_MONTH = new Date("2030-06-15T12:00:00.000Z");

function resetCreateMeetState() {
  useCreateMeetStore.getState().resetForm();
  useCreateMeetStore.getState().clearErrors();
}

test.describe("Calendar (CT screenshots)", () => {
  test.beforeEach(() => {
    resetCreateMeetState();
  });

  test("ct harness sanity: mounts basic element", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );
    await mount(<div data-test-id='ct-sanity'>ok</div>);
    await expect(page.getByText("ok", { exact: true })).toBeVisible();
  });

  test("debug: react-calendar renders in CT", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );
    await mount(
      <ReactCalendar
        locale='ru-RU'
        minDetail='month'
        minDate={new Date("2030-06-01T00:00:00.000Z")}
        value={FIXED_MONTH}
        next2Label={null}
        prev2Label={null}
      />,
    );
    await expect(page.locator(".react-calendar")).toBeVisible({ timeout: 15_000 });
  });

  test("shows suggestion when no dates selected", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    await mount(
      <Calendar
        minDate={new Date("2030-06-01T00:00:00.000Z")}
        value={FIXED_MONTH}
        suggestMessage='Выберите минимум один день'
      />,
    );

    const root = page.locator('[data-test-id="calendar"]');
    await expect(root).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Выберите минимум один день")).toBeVisible({ timeout: 15_000 });
    await expect(root).toHaveScreenshot("calendar-suggest.png", { animations: "disabled" });
  });

  test("renders selected day styles when date is selected", async ({ mount, page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    useCreateMeetStore.getState().setValue("dates", ["2030-06-15"]);

    await mount(<Calendar minDate={new Date("2030-06-01T00:00:00.000Z")} value={FIXED_MONTH} />);
    const root = page.locator('[data-test-id="calendar"]');
    await expect(root).toBeVisible({ timeout: 15_000 });
    await expect(root).toHaveScreenshot("calendar-selected-day.png", { animations: "disabled" });
  });

  test("renders error state for dates field", async ({ mount }, testInfo) => {
    test.skip(true, "Calendar error rendering is covered via /create E2E; CT setup for this state is flaky.");
    test.skip(
      testInfo.project.name !== "chromium",
      "CT visual baselines are maintained only for chromium desktop project.",
    );

    useCreateMeetStore.getState().setError("dates", "Максимум можно выбрать 30 дней");
    await mount(<Calendar minDate={new Date("2030-06-01T00:00:00.000Z")} value={FIXED_MONTH} />);
  });
});
