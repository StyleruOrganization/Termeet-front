import { useEffect } from "react";
import { useTheme } from "@/shared/libs";
import { useSessionStore } from "../model/store/useSessionStore";

export const useSyncUserPreferences = () => {
  const theme = useSessionStore(state => state.user?.theme);
  const { setTheme, isInitialized } = useTheme();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }
    if (theme === "light" || theme === "dark") {
      setTheme(theme);
    }
  }, [theme, isInitialized, setTheme]);
};
