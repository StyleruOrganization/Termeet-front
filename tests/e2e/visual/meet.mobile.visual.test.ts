import { expect, test, type Page } from "@playwright/test";
import { E2E_MOCK_MEET_HASH } from "../helpers";

/**
 * Visual regression for `/meet/:hash` on mobile (mobile-chrome).
 *
 * Update snapshots:
 *   NODE_ENV=test pnpm exec playwright test tests/e2e/visual/meet.mobile.visual.test.ts --project=mobile-chrome --update-snapshots
 */

type MeetWire = {
  name: string;
  description?: string | null;
  link?: string | null;
  duration?: string | null;
  dataRange: [string, string][];
  hash: string;
  slots: { name: string; slots: [string, string][] }[];
};

function baseMeet(overrides: Partial<MeetWire> = {}): MeetWire {
  return {
    name: "E2E — meet mobile screenshots",
    description: "Описание для мобильного визуального теста.",
    link: "https://telemost.yandex.ru/j/e2e-room",
    duration: "1 час",
    dataRange: [["2030-06-15T08:00:00.000Z", "2030-06-15T12:00:00.000Z"]],
    hash: E2E_MOCK_MEET_HASH,
    slots: [],
    ...overrides,
  };
}

function installMeetGetMock(page: Page, body: MeetWire) {
  const hash = body.hash;
  return page.route("**/api/meet/**", async route => {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const method = req.method();

    if (method === "GET" && path === `/api/meet/${hash}`) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
      return;
    }

    await route.continue();
  });
}

async function gotoMeetForScreenshot(page: Page, body: MeetWire) {
  await page.goto(`/meet/${body.hash}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(body.name, { exact: true }).first()).toBeVisible({ timeout: 25_000 });
  const meetPage = page.getByTestId("meet-page").or(page.locator('[class*="MeetPage"]').first());
  await expect(meetPage).toBeVisible({ timeout: 25_000 });
  await page.evaluate(() => document.fonts.ready);
}

test.describe("Meet page mobile screenshots", () => {
  test("meet page viewport (mobile)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "Baselines are maintained only for mobile-chrome.");

    const body = baseMeet();
    await installMeetGetMock(page, body);
    await gotoMeetForScreenshot(page, body);

    await expect(page).toHaveScreenshot("meet-mobile-viewport.png", {
      animations: "disabled",
      fullPage: false,
      threshold: 0.2,
    });
  });

  test("meet page block (mobile)", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-chrome", "Baselines are maintained only for mobile-chrome.");

    const body = baseMeet();
    await installMeetGetMock(page, body);
    await gotoMeetForScreenshot(page, body);

    const scope = page.getByTestId("meet-page").or(page.locator('[class*="MeetPage"]').first());
    await expect(scope).toBeVisible();
    await expect(scope).toHaveScreenshot("meet-page-mobile.png", {
      animations: "disabled",
      threshold: 0.2,
    });
  });
});
