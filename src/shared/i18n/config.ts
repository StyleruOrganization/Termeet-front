import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { de, en, ru } from "./lib/messages";
import { LOCALE_BCP, LOCALE_STORAGE_KEY, parseLocale, readStoredLocale, type Locale } from "./model/locale";

const initial = readStoredLocale();

if (typeof document !== "undefined") {
  document.documentElement.lang = LOCALE_BCP[initial];
}

void i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
    de: { translation: de },
  },
  lng: initial,
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", language => {
  const locale = parseLocale(language);
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // private mode
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = LOCALE_BCP[locale];
  }
});

export const changeAppLocale = (locale: Locale) => {
  return i18n.changeLanguage(parseLocale(locale));
};

export { i18n };
