export type Locale = "ru" | "en" | "de";

export const LOCALES: Locale[] = ["ru", "en", "de"];
export const LOCALE_LABEL: Record<Locale, string> = {
  ru: "Русский",
  en: "English",
  de: "Deutsch",
};
export const LOCALE_BCP: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
  de: "de-DE",
};
export const LOCALE_STORAGE_KEY = "termeet.locale";

export const parseLocale = (value: string | null | undefined): Locale => {
  if (value === "en" || value === "English") {
    return "en";
  }
  if (value === "de" || value === "Deutsch") {
    return "de";
  }
  return "ru";
};

export const readStoredLocale = (): Locale => {
  try {
    return parseLocale(localStorage.getItem(LOCALE_STORAGE_KEY) || localStorage.getItem("termeet.language"));
  } catch {
    return "ru";
  }
};
