import { test, expect } from "@playwright/test";
import {
  mockMeetTimezones,
  mockMeetingInfoWithUserSlots,
  mockMeetTimezonesSpecial,
} from "@/shared/mocks/Meet/meet.mock";

const uid = "d6d85ef8-1673-4194-9069-598c7cf739dd";
const timeZoneUid = "1893e8e1-0c70-4bc5-8be8-61acc0b06a61";
const timeZoneSpecificUid = "0ed402e2-a03e-4598-9eee-6a7fc26b7d46";

test.describe("Meet Page", () => {
  test("Default", async ({ page }) => {
    await page.route(`https://termeet.tech/api/meet/${uid}`, route => {
      route.fulfill({
        json: mockMeetingInfoWithUserSlots,
      });
    });

    await page.evaluate(() => {
      // Remove tanstack query button, it intercepts clicking on the expand menu button
      const element = document.querySelector(".tsqd-open-btn-container");
      console.log("element", element);

      if (element) {
        element.remove();
      }
    });

    await page.goto(`/meet/${uid}`);

    // Ждем загрузки страницы
    await page.waitForSelector("[data-test-id='meet-page']", {
      state: "visible",
      timeout: 5000,
    });

    await page.waitForTimeout(1000);

    const nameMeet = page.locator("[data-test-id='meet-name']");
    const meetDesc = page.locator("[data-test-id='meet-description']");

    await expect(nameMeet).toHaveText(mockMeetingInfoWithUserSlots.name);
    await expect(meetDesc).toHaveText(mockMeetingInfoWithUserSlots.description);

    // Скриншот 1: Компонент со списком людей
    const peopleComponent = page.locator("[data-test-id='meet-people']");
    await peopleComponent.scrollIntoViewIfNeeded();
    await expect(peopleComponent).toHaveScreenshot("default-meet-people.png");

    const editButton = page.locator("[data-test-id='edit-mode-meet-button']");
    const cell = page.locator("[data-id='2026-02-03T13:30']");
    await editButton.click();
    await cell.click();
    await editButton.click();

    // Скриншот 2: Компонент модального окна
    const modal = page.locator("[data-test-id='meet-modal']");
    await expect(modal).toHaveScreenshot("modal-meet.png");

    const closeBtn = page.locator("[data-test-id='close-modal']");
    await closeBtn.click();

    const cancelBtn = page.locator("[data-test-id='cancel-meet-button']");
    await cancelBtn.click();

    // Скриншот 3: Полная страница
    await expect(page).toHaveScreenshot("default-meet.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  test("TimeZones", async ({ page }) => {
    await page.route(`https://termeet.tech/api/meet/${timeZoneUid}`, route => {
      route.fulfill({
        json: mockMeetTimezones,
      });
    });

    await page.goto(`/meet/${timeZoneUid}`);

    const nameMeet = page.locator("[data-test-id='meet-name']");
    const meetDesc = page.locator("[data-test-id='meet-description']");

    await expect(nameMeet).toHaveText(mockMeetTimezones.name);
    await expect(meetDesc).toHaveText(mockMeetTimezones.description);

    await page.waitForTimeout(1000);

    // Скриншот всей страницы
    await expect(page).toHaveScreenshot("time-zones-meet.png", {
      fullPage: true,
      animations: "disabled",
    });
  });

  // Сомтрим на случай когда, есть переход причем нет промежутков между timeRanges и слоты сливаются, не должно быть ...
  test("Timezones specific", async ({ page }) => {
    await page.route(`https://termeet.tech/api/meet/${timeZoneSpecificUid}`, route => {
      route.fulfill({
        json: mockMeetTimezonesSpecial,
      });
    });

    await page.goto(`/meet/${timeZoneSpecificUid}`);

    await page.waitForTimeout(1000);

    // Скриншот всей страницы
    await expect(page).toHaveScreenshot("time-zones-meet-specific.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
