import { expect, test, type Page, type Route } from "@playwright/test";
import { E2E_MOCK_MEET_HASH } from "../helpers";

/**
 * `/meet/:hash`. GET/PATCH mocked — works locally and with PLAYWRIGHT_BASE_URL against prod.
 * Describe/test titles are English; UI assertions keep Russian copy where needed.
 * `describe.serial`: single `/api/meet/**` route per page — parallel workers caused flaky routing.
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

const DESC_TEXT = "Текст описания для проверки раскрытия блока на десктопе.";

/**
 * Один обработчик на страницу: два вызова page.route на один и тот же glob давали нестабильный порядок
 * и после continue() часть GET могла не доходить до fulfill → зависание Suspense без UI встречи.
 */
function installMeetApiMock(page: Page, body: MeetWire, patchHandler?: (route: Route) => Promise<void>) {
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

    if (method === "PATCH" && path === `/api/meet/${hash}/slots`) {
      if (patchHandler) {
        await patchHandler(route);
      } else {
        await route.continue();
      }
      return;
    }

    await route.continue();
  });
}

/** Страница готова: заголовок с именем встречи появляется сразу после успешного GET (раньше таймзоны). */
async function gotoMeet(page: Page, hash = E2E_MOCK_MEET_HASH, query?: Record<string, string>, meetWire?: MeetWire) {
  const title = (meetWire ?? baseMeet()).name;
  const qs = query ? `?${new URLSearchParams(query).toString()}` : "";
  await page.goto(`/meet/${hash}${qs}`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(title, { exact: true }).first()).toBeVisible({ timeout: 25_000 });
}

function baseMeet(overrides: Partial<MeetWire> = {}): MeetWire {
  return {
    name: "E2E — страница встречи",
    description: DESC_TEXT,
    link: "https://telemost.yandex.ru/j/e2e-room",
    duration: "1 час",
    dataRange: [["2030-06-15T08:00:00.000Z", "2030-06-15T12:00:00.000Z"]],
    hash: E2E_MOCK_MEET_HASH,
    slots: [],
    ...overrides,
  };
}

/** Имя встречи из `baseMeet()` — дефолт для локаторов шапки без явного `body.name`. */
const E2E_DEFAULT_MEET_TITLE = baseMeet().name;

/** `grantPermissions` для clipboard в Playwright — только Chromium (в т.ч. mobile-chrome). */
function platformSupportsClipboardPermissionGrant(browserName: string): boolean {
  return browserName === "chromium";
}

/** Узкая вёрстка: описание открывается в модалке, а не через класс `MeetHeader__expanded`. */
function isMobileMeetProject(projectName: string): boolean {
  return projectName === "mobile-chrome" || projectName === "mobile-safari";
}

/** Локаторы с fallback для билдов без data-test-id на проде */
function locMeetHeader(title: string, page: Page) {
  return page.getByTestId("meet-header").or(page.locator('[class*="MeetHeader"]').filter({ hasText: title }).first());
}

function locMeetTable(page: Page) {
  return page.getByTestId("meet-table").or(page.locator('[class*="MeetTable"]').first());
}

/**
 * Блок «По местному / По Москве». Без цепочки `.or()`: иначе в union попадают `#root`,
 * обёртка `meet-timezone-toggle` и `ToogleContainer` → strict mode violation.
 * Переключатель темы в хедере не содержит этих подписей — XPath однозначен.
 */
function locTimezoneToggle(page: Page) {
  return page
    .getByRole("button", { name: /По местному/ })
    .locator("xpath=ancestor::div[contains(@class,'ToogleContainer')][1]");
}

/** На старых прод-билдах `<a>` без href попадает в дерево как generic, не link — нужен getByText. */
function locRoomLink(page: Page, headerTitle: string) {
  const scope = locMeetHeader(headerTitle, page);
  return scope
    .getByTestId("meet-header-copy-room-link")
    .or(scope.getByRole("link", { name: "Ссылка на встречу" }))
    .or(scope.getByText("Ссылка на встречу", { exact: true }));
}

/**
 * Первая строка кнопок под участниками: шаринг + блок редактирования.
 * На проде без aria/test-id копирование страницы — кнопка только с иконкой (см. accessibility snapshot).
 */
function locMeetInfoActionsRow(page: Page) {
  return page.locator('[class*="MeetInfo__Buttons"]').first();
}

/** Ряд «Отменить» / «Сохранить» в режиме выбора слотов (не путать с модалкой). */
function locMeetInfoButtonsEdit(page: Page) {
  return page.locator('[class*="MeetInfo__ButtonsEdit"]').first();
}

function locSharePage(page: Page) {
  const row = locMeetInfoActionsRow(page);
  return row
    .getByTestId("meet-share-page-url")
    .or(row.getByRole("button", { name: "Поделиться ссылкой на страницу встречи" }))
    .or(row.getByRole("button", { name: "Поделиться встречей" }))
    .or(row.locator('[class*="MeetInfo__ShareButton"]'));
}

function locExpandDesc(page: Page, headerTitle: string = E2E_DEFAULT_MEET_TITLE) {
  const scope = locMeetHeader(headerTitle, page);
  const infoRow = scope.locator('[class*="MeetHeader__Info"]').first();
  return scope
    .getByTestId("meet-header-expand-desc")
    .or(scope.getByRole("button", { name: "Показать или скрыть описание встречи" }))
    .or(infoRow.locator("button").nth(1));
}

function locEditMeet(page: Page, headerTitle: string = E2E_DEFAULT_MEET_TITLE) {
  const scope = locMeetHeader(headerTitle, page);
  const infoRow = scope.locator('[class*="MeetHeader__Info"]').first();
  return scope
    .getByTestId("meet-header-edit")
    .or(scope.getByRole("button", { name: "Редактировать встречу" }))
    .or(infoRow.locator("button").first());
}

function locAddTime(page: Page) {
  return page.getByRole("button", { name: "Добавить время" }).or(page.getByTestId("meet-add-time"));
}

function locCancelEditSlots(page: Page) {
  const row = locMeetInfoButtonsEdit(page);
  return row
    .getByTestId("meet-cancel-edit-slots")
    .or(row.getByRole("button", { name: "Отменить выбор времени" }))
    .or(row.getByRole("button", { name: "Отменить" }));
}

function locSaveSlotsOpenModal(page: Page) {
  const row = locMeetInfoButtonsEdit(page);
  return row
    .getByTestId("meet-save-slots-open-modal")
    .or(row.getByRole("button", { name: "Сохранить выбранные слоты" }))
    .or(row.getByRole("button", { name: "Сохранить" }));
}

function locParticipantsToggle(page: Page) {
  const scope = page.locator('[class*="MeetPeoples__Title"]').first();
  return scope
    .getByTestId("meet-participants-toggle")
    .or(scope.getByRole("button", { name: "Свернуть или развернуть список участников" }))
    .or(scope.locator("button").first());
}

function locSlotsModal(page: Page) {
  return page.getByRole("dialog").filter({ hasText: "Как тебя зовут?" });
}

function locModalSubmit(page: Page) {
  return page.getByRole("button", { name: "Сохранить слоты" }).or(page.getByTestId("meet-modal-submit-slots"));
}

function locModalCancel(page: Page) {
  return locSlotsModal(page).getByRole("button", { name: "Отменить" }).or(page.getByTestId("meet-modal-cancel"));
}

/** Только строка описания в шапке (не `<pre>` в модалке мобильного описания) */
function locHeaderDescriptionBlock(page: Page) {
  return page.locator('[class*="MeetHeader__desc"]').filter({ hasText: DESC_TEXT });
}

async function firstSelectableSlot(page: Page) {
  const cell = page.locator('[data-disabled-cell="false"][data-id^="20"]').first();
  await expect(cell).toBeVisible({ timeout: 15_000 });
  return cell;
}

test.describe.serial("Meet page", () => {
  test.describe("Loading and header", () => {
    test("renders title, duration, table and timezone toggle", async ({ page }) => {
      const body = baseMeet();
      await installMeetApiMock(page, body);
      await gotoMeet(page);

      await expect(locMeetHeader(body.name, page)).toBeVisible();
      await expect(locMeetHeader(body.name, page)).toContainText(body.name);
      await expect(locMeetHeader(body.name, page)).toContainText(body.duration!);
      await expect(locMeetTable(page)).toBeVisible();
      await expect(locTimezoneToggle(page)).toBeVisible();
      await expect(page.getByRole("button", { name: /По местному/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /По Москве/ })).toBeVisible();
    });

    test("room link copies conference URL and shows toast", async ({ page, context, browserName }) => {
      test.skip(
        !platformSupportsClipboardPermissionGrant(browserName),
        "clipboard permission grants are Chromium-only in Playwright",
      );
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      const body = baseMeet();
      await installMeetApiMock(page, body);
      await gotoMeet(page);

      await locRoomLink(page, body.name).click();
      await expect(page.getByText("Ссылка скопирована")).toBeVisible();
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      expect(clip).toBe(body.link);
    });

    test("share button copies meet page URL", async ({ page, context, browserName }) => {
      test.skip(
        !platformSupportsClipboardPermissionGrant(browserName),
        "clipboard permission grants are Chromium-only in Playwright",
      );
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await installMeetApiMock(page, baseMeet());
      await gotoMeet(page);

      await locSharePage(page).click();
      await expect(page.getByText("Ссылка скопирована")).toBeVisible();
      const clip = await page.evaluate(() => navigator.clipboard.readText());
      expect(clip).toContain(`/meet/${E2E_MOCK_MEET_HASH}`);
    });

    test("description toggle shows and hides header description", async ({ page }, testInfo) => {
      test.skip(
        isMobileMeetProject(testInfo.project.name),
        "narrow viewport uses description modal instead of expanding MeetHeader__desc",
      );
      await installMeetApiMock(page, baseMeet());
      await gotoMeet(page);

      const descBlock = locHeaderDescriptionBlock(page);
      await expect(descBlock).toBeHidden();
      await locExpandDesc(page).click();
      await expect(descBlock).toBeVisible();
      await locExpandDesc(page).click();
      await expect(descBlock).toBeHidden();
    });

    test("edit navigates to edit route preserving query string", async ({ page }) => {
      await installMeetApiMock(page, baseMeet());
      await gotoMeet(page, E2E_MOCK_MEET_HASH, { localTime: "false" });

      await locEditMeet(page).click();
      await expect(page).toHaveURL(new RegExp(`/meet/edit/${E2E_MOCK_MEET_HASH}\\?localTime=false`));
    });
  });

  test.describe("Participants", () => {
    test("empty slots shows placeholder and zero participant count", async ({ page }) => {
      await installMeetApiMock(page, baseMeet({ slots: [] }));
      await gotoMeet(page);
      await expect(page.getByText("Пока никто не проголосовал")).toBeVisible();
      await expect(page.getByRole("heading", { name: /Участники/ })).toContainText("0");
    });

    test("participant slots render and list toggle collapses names", async ({ page }) => {
      await installMeetApiMock(
        page,
        baseMeet({
          slots: [
            {
              name: "Пользователь Альфа",
              slots: [["2030-06-15T09:00:00.000Z", "2030-06-15T10:00:00.000Z"]],
            },
            {
              name: "Пользователь Бета",
              slots: [["2030-06-15T10:00:00.000Z", "2030-06-15T11:00:00.000Z"]],
            },
          ],
        }),
      );
      await gotoMeet(page);

      await expect(page.getByText("Пользователь Альфа")).toBeVisible();
      await expect(page.getByText("Пользователь Бета")).toBeVisible();
      await expect(page.getByText("Пока никто не проголосовал")).toHaveCount(0);

      await locParticipantsToggle(page).click();
      await expect(page.getByText("Пользователь Альфа")).toBeHidden({ timeout: 5000 });
      await locParticipantsToggle(page).click();
      await expect(page.getByText("Пользователь Альфа")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Timezone query param", () => {
    test("Moscow/local toggle updates localTime in URL", async ({ page }) => {
      const offsetHours = -new Date().getTimezoneOffset() / 60;
      test.skip(offsetHours === 3, "local timezone equals Moscow — toggle does not change URL params");

      await installMeetApiMock(page, baseMeet());
      await gotoMeet(page);

      await page.getByRole("button", { name: /По Москве/ }).click();
      await expect(page).toHaveURL(/localTime=false/);

      await page.getByRole("button", { name: /По местному/ }).click();
      await expect(page).toHaveURL(/localTime=true/);
    });
  });

  test.describe("Slot editing", () => {
    test("add-time mode: cancel restores idle state", async ({ page }) => {
      await installMeetApiMock(page, baseMeet());
      await gotoMeet(page);

      await expect(locAddTime(page)).toBeVisible();
      await locAddTime(page).click();
      await expect(locCancelEditSlots(page)).toBeVisible();
      await expect(locSaveSlotsOpenModal(page)).toBeDisabled();

      await locCancelEditSlots(page).click();
      await expect(locAddTime(page)).toBeVisible();
    });

    test("save stays disabled until a slot is selected", async ({ page }) => {
      await installMeetApiMock(page, baseMeet());
      await gotoMeet(page);
      await locAddTime(page).click();
      await expect(locSaveSlotsOpenModal(page)).toBeDisabled();
    });

    test("slot selection, modal, PATCH body and success toast", async ({ page }) => {
      let patchBody: Record<string, unknown> | null = null;
      await installMeetApiMock(page, baseMeet(), async route => {
        patchBody = route.request().postDataJSON() as Record<string, unknown>;
        await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
      });

      await gotoMeet(page);
      await locAddTime(page).click();
      await (await firstSelectableSlot(page)).click();

      await expect(locSaveSlotsOpenModal(page)).toBeEnabled();
      await locSaveSlotsOpenModal(page).click();

      await expect(locSlotsModal(page)).toBeVisible();
      await page.getByLabel("Как тебя зовут?").fill(`Участник E2E ${Date.now()}`);
      await locModalSubmit(page).click();

      await expect(page.getByText("Выбранные временные слоты успешно сохранены")).toBeVisible({ timeout: 15_000 });
      await expect(locSlotsModal(page)).toHaveCount(0, { timeout: 10_000 });

      expect(patchBody).not.toBeNull();
      expect(patchBody!.name).toBeTruthy();
      expect(Array.isArray(patchBody!.slots)).toBe(true);
    });

    test("modal rejects duplicate existing participant name", async ({ page }) => {
      await installMeetApiMock(
        page,
        baseMeet({
          slots: [
            {
              name: "Уже есть в списке",
              slots: [["2030-06-15T09:00:00.000Z", "2030-06-15T09:30:00.000Z"]],
            },
          ],
        }),
        async route => {
          await route.fulfill({ status: 200, body: "{}" });
        },
      );

      await gotoMeet(page);
      await locAddTime(page).click();
      await (await firstSelectableSlot(page)).click();
      await locSaveSlotsOpenModal(page).click();

      await page.getByLabel("Как тебя зовут?").fill("Уже есть в списке");
      await expect(page.getByText("Пользователь с таким именем уже существует!")).toBeVisible();
      await expect(locModalSubmit(page)).toBeDisabled();
    });

    test("modal cancel closes without PATCH", async ({ page }) => {
      let patchCount = 0;
      await installMeetApiMock(page, baseMeet(), async route => {
        patchCount += 1;
        await route.fulfill({ status: 200, body: "{}" });
      });

      await gotoMeet(page);
      await locAddTime(page).click();
      await (await firstSelectableSlot(page)).click();
      await locSaveSlotsOpenModal(page).click();
      await expect(locSlotsModal(page)).toBeVisible();

      await locModalCancel(page).click();
      await expect(locSlotsModal(page)).toHaveCount(0, { timeout: 10_000 });
      expect(patchCount).toBe(0);
    });

    test("PATCH error shows error toast", async ({ page }) => {
      await installMeetApiMock(page, baseMeet(), async route => {
        await route.fulfill({ status: 500, contentType: "application/json", body: '{"message":"fail"}' });
      });

      await gotoMeet(page);
      await locAddTime(page).click();
      await (await firstSelectableSlot(page)).click();
      await locSaveSlotsOpenModal(page).click();
      await page.getByLabel("Как тебя зовут?").fill("Ошибка PATCH");
      await locModalSubmit(page).click();

      await expect(page.getByText("Ошибка при сохранении выбранных временных слотов")).toBeVisible({
        timeout: 15_000,
      });
    });

    test("empty participant name does not send PATCH", async ({ page }) => {
      let patchCount = 0;
      await installMeetApiMock(page, baseMeet(), async route => {
        patchCount += 1;
        await route.fulfill({ status: 200, body: "{}" });
      });

      await gotoMeet(page);
      await locAddTime(page).click();
      await (await firstSelectableSlot(page)).click();
      await locSaveSlotsOpenModal(page).click();

      await expect(locModalSubmit(page)).toBeDisabled();
      await locModalSubmit(page).click({ force: true });
      expect(patchCount).toBe(0);
    });
  });

  test.describe("Slot hover", () => {
    test("hovering a slot shows interval and participant label", async ({ page }) => {
      await installMeetApiMock(page, baseMeet());
      await gotoMeet(page);

      const cell = await firstSelectableSlot(page);
      await cell.hover();
      await expect(page.getByText(/\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/).first()).toBeVisible({ timeout: 8000 });
      await expect(page.getByText(/участников/)).toBeVisible();
    });
  });
});
