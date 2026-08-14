import "./config";

export type { Locale } from "./model/locale";
export { LOCALES, LOCALE_LABEL, LOCALE_BCP, parseLocale, readStoredLocale } from "./model/locale";
export { changeAppLocale, i18n } from "./config";
export { useTranslation } from "react-i18next";
