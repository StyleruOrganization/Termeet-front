export const BOT_RESERVED = [
  "start",
  "help",
  "meet",
  "meetings",
  "push",
  "next",
  "link",
  "unlink",
  "cancel",
  "about",
  "template",
  "status",
] as const;

export const BOT_DURATIONS = ["30 мин", "1 час", "1,5 часа", "2 часа", "2,5 часа", "3 часа"] as const;

export type BotDateMode = "off" | "optional" | "required";
export type BotTimeMode = "off" | "optional" | "required";
export type BotTeamMode = "off" | "arg" | "pinned";

export interface IBotTemplate {
  id: string;
  slug: string;
  name: string;
  description: string;
  duration: string;
  date_mode: BotDateMode;
  date_default_today: boolean;
  aliases_today: string[];
  aliases_tomorrow: string[];
  aliases_day_after: string[];
  team_mode: BotTeamMode;
  team_id: number | null;
  time_mode: BotTimeMode;
  time_default: string | null;
  window_start: string;
  window_end: string;
}

const SLUG_RE = /^[a-z][a-z0-9_]{0,15}$/;
const ALIAS_RE = /^[a-zа-яё0-9_-]{1,16}$/i;
const TIME_RE = /^([01]?\d|2[0-3]):([03]0)$/;
const DATE_RE = /^(\d{1,2})\.(\d{1,2})(?:\.(\d{2}|\d{4}))?$/;

export const normalizeToken = (value: string) =>
  value
    .trim()
    .replace(/^[/\\]+/, "")
    .toLowerCase()
    .replaceAll("ё", "е");

export const parseAliasInput = (value: string) => {
  const seen: string[] = [];
  value.split(/[,\s]+/).forEach(part => {
    const token = normalizeToken(part);
    if (token && !seen.includes(token)) {
      seen.push(token);
    }
  });
  return seen;
};

const isClock = (value: string) => TIME_RE.test(value.trim());
const isDate = (value: string) => DATE_RE.test(value.trim());

const startsLikeMention = (token: string) => token.startsWith("@") || token.includes("@");

const checkAlias = (token: string) => {
  if (startsLikeMention(token)) {
    return "Нельзя начинать с @ — так бот отличает людей";
  }
  if (BOT_RESERVED.includes(token as (typeof BOT_RESERVED)[number])) {
    return `«${token}» занято командой бота`;
  }
  if (!ALIAS_RE.test(token)) {
    return `«${token}» не подходит: буквы, цифры, дефис или _`;
  }
  if (isClock(token) || isDate(token)) {
    return `«${token}» похоже на время или дату`;
  }
  return null;
};

const checkSlug = (token: string) => {
  if (startsLikeMention(token)) {
    return "Нельзя начинать с @ — так бот отличает людей";
  }
  if (BOT_RESERVED.includes(token as (typeof BOT_RESERVED)[number])) {
    return `«${token}» занято командой бота`;
  }
  if (!SLUG_RE.test(token)) {
    return "Ключ: латиница, цифры и _, с буквы, до 16 символов";
  }
  return null;
};

export const emptyBotTemplate = (): IBotTemplate => ({
  id: crypto.randomUUID(),
  slug: "",
  name: "",
  description: "",
  duration: "30 мин",
  date_mode: "required",
  date_default_today: false,
  aliases_today: [],
  aliases_tomorrow: [],
  aliases_day_after: [],
  team_mode: "off",
  team_id: null,
  time_mode: "off",
  time_default: null,
  window_start: "09:00",
  window_end: "18:00",
});

export const previewBotCommand = (item: IBotTemplate, teamSlug?: string) => {
  const parts = [`/template ${item.slug || "ключ"}`];
  if (item.team_mode === "arg") {
    parts.push(teamSlug || "slug-команды");
  }
  parts.push("@люди");
  if (item.date_mode !== "off") {
    const sample = item.aliases_today[0] || item.aliases_tomorrow[0] || "15.08";
    parts.push(sample);
  }
  if (item.time_mode !== "off") {
    parts.push(item.time_default || "16:00");
  }
  return parts.join(" ");
};

export const validateBotTemplates = (items: IBotTemplate[], teamSlugs: string[] = []): string | null => {
  if (items.length > 10) {
    return "Максимум 10 шаблонов";
  }
  const teams = teamSlugs.map(normalizeToken).filter(Boolean);
  const slugs: string[] = [];
  const aliases = new Map<string, string>();
  for (const item of items) {
    const slug = normalizeToken(item.slug);
    const slugError = checkSlug(slug);
    if (slugError) {
      return slugError;
    }
    if (!item.name.trim()) {
      return "Укажите название встречи в шаблоне";
    }
    if (slugs.includes(slug)) {
      return `Ключ «${slug}» уже есть у другого шаблона`;
    }
    slugs.push(slug);
    if (item.team_mode === "pinned" && !item.team_id) {
      return "Выберите команду для шаблона";
    }
    if (item.window_end <= item.window_start) {
      return "Конец окна должен быть позже начала";
    }
    if (
      item.time_mode !== "off" &&
      item.time_default &&
      (item.time_default < item.window_start || item.time_default >= item.window_end)
    ) {
      return "Время по умолчанию вне окна слотов";
    }
    const own = [...item.aliases_today, ...item.aliases_tomorrow, ...item.aliases_day_after].map(normalizeToken);
    const unique = new Set(own);
    if (unique.size !== own.length) {
      return "Один алиас указан дважды в шаблоне";
    }
    for (const alias of own) {
      const aliasError = checkAlias(alias);
      if (aliasError) {
        return aliasError;
      }
      if (alias === slug) {
        return `Ключ «${slug}» совпадает с алиасом даты`;
      }
      const owner = aliases.get(alias);
      if (owner && owner !== slug) {
        return `Алиас «${alias}» уже занят шаблоном «${owner}»`;
      }
      aliases.set(alias, slug);
    }
  }
  for (const slug of slugs) {
    if (aliases.has(slug)) {
      return `Ключ «${slug}» совпадает с алиасом даты`;
    }
    if (teams.includes(slug)) {
      return `Ключ «${slug}» совпадает со slug команды`;
    }
  }
  for (const [alias, owner] of aliases) {
    if (teams.includes(alias)) {
      return `Алиас «${alias}» шаблона «${owner}» совпадает со slug команды`;
    }
  }
  return null;
};

export const validateTeamSlug = (value: string, aliasPool: string[] = []) => {
  const token = normalizeToken(value);
  if (!token) {
    return "Укажите slug команды";
  }
  const aliasError = checkAlias(token);
  if (aliasError) {
    return aliasError;
  }
  if (aliasPool.includes(token)) {
    return `«${token}» совпадает с алиасом или ключом шаблона бота`;
  }
  return null;
};

const TRANSLIT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "h",
  ц: "c",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export const suggestTeamSlug = (name: string) => {
  const letters = name
    .trim()
    .toLowerCase()
    .split("")
    .map(char => TRANSLIT[char] ?? char)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .replaceAll("-", "_")
    .slice(0, 16);
  if (!letters || !SLUG_RE.test(letters.startsWith("_") ? `t${letters}` : letters)) {
    const padded = letters.replace(/^[^a-z]+/, "") || "team";
    return padded.slice(0, 16);
  }
  return letters;
};
