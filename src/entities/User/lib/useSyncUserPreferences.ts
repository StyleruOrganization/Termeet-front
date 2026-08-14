import { useEffect } from "react";
import { changeAppLocale, parseLocale } from "@/shared/i18n";
import { useTheme } from "@/shared/libs";
import { useSessionStore } from "../model/store/useSessionStore";

export const useSyncUserPreferences = () => {
  const theme = useSessionStore(state => state.user?.theme);
  const locale = useSessionStore(state => state.user?.locale);
  const { setTheme, isInitialized } = useTheme();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    if (theme === "light" || theme === "dark") {
      setTheme(theme);
    }
  }, [theme, isInitialized, setTheme]);

  useEffect(() => {
    if (locale) {
      void changeAppLocale(parseLocale(locale));
    }
  }, [locale]);
};
