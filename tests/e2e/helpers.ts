import { expect, type Page } from "@playwright/test";

/** Общий UUID для моков API создания встречи и загрузки страницы `/meet/:hash` в E2E. */
export const E2E_MOCK_MEET_HASH = "550e8400-e29b-41d4-a716-446655440000";

/** true если PLAYWRIGHT_BASE_URL указывает не на локальный дев-сервер (например прод/staging). */
export function e2eUsesRemoteBackend(): boolean {
  const u = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:5173";
  return !u.includes("localhost") && !u.includes("127.0.0.1");
}

/** Обёртка календаря на `/create`: test id или форма с `.react-calendar` (старые деплои без атрибута). */
export function calendarScope(page: Page) {
  const byTestId = page.getByTestId("calendar");
  const legacyForm = page.locator("form").filter({
    has: page.locator(".react-calendar"),
    hasNot: page.locator('[data-test-id="calendar"]'),
  });
  return byTestId.or(legacyForm);
}

/** Верхняя панель: новый `layout-header`, семантический `<header>`, либо старый лэндинг только с логотипом. */
export function layoutChrome(page: Page) {
  return page
    .getByTestId("layout-header")
    .or(page.locator("header"))
    .or(page.getByRole("button", { name: /termeet/i }))
    .or(page.getByRole("heading", { name: /^termeet$/i }));
}

/**
 * Клик по первому доступному дню (locale ru-RU: имя кнопки содержит «2026 г.» и т.п.).
 * Классы `.react-calendar__tile` на проде/в снимках a11y часто не видны — опираемся на role + name.
 */
const RU_MONTH_GENITIVE = "(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)";

/** Первый доступный день месяца в react-calendar (ru-RU). */
export async function clickSelectableCalendarDay(page: Page) {
  const grid = page.locator("form .react-calendar");
  await expect(grid).toBeVisible({ timeout: 15_000 });

  const byRole = grid.getByRole("button", {
    name: new RegExp(`^\\d{1,2}\\s+${RU_MONTH_GENITIVE}\\s+\\d{4}`, "i"),
    disabled: false,
  });
  if ((await byRole.count()) > 0) {
    const dayBtn = byRole.first();
    await expect(dayBtn).toBeVisible({ timeout: 15_000 });
    await dayBtn.click();
    return;
  }
  const fallback = grid.locator("button:not([disabled])").filter({ hasNotText: /Go to/i }).first();
  await expect(fallback).toBeVisible({ timeout: 15_000 });
  await fallback.click();
}

/** Строгий UUID из схемы фронта */
export const MEET_PATH_REGEX = /\/meet\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Если бэкенд вернёт не-uuid slug — всё равно считаем переход успешным */
export const MEET_PATH_REGEX_LOOSE = /\/meet\/[^/?#]+/;
