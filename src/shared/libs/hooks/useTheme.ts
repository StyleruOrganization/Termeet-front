import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const [isInitialized, setIsInitialized] = useState(false);

  // Получение системной темы
  const getSystemTheme = useCallback((): Theme => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // Получение сохраненной темы или системной
  const getInitialTheme = useCallback((): Theme => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;

    console.log("THEME SAVED:", savedTheme);
    console.log("SYSTEM THEME:", getSystemTheme());

    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      return savedTheme;
    }

    return getSystemTheme();
  }, [getSystemTheme]);

  // Применение темы к DOM
  const applyTheme = useCallback((newTheme: Theme) => {
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }, []);

  // Установка темы
  const setThemeAndSave = useCallback(
    (newTheme: Theme) => {
      setTheme(newTheme);
      applyTheme(newTheme);
    },
    [applyTheme],
  );

  // Инициализация темы
  useEffect(() => {
    const initialTheme = getInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsInitialized(true);
  }, [getInitialTheme, applyTheme]);

  // Следим за изменением системной темы (опционально)
  useEffect(() => {
    if (!isInitialized) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Меняем тему только если пользователь явно не сохранял свою
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
        applyTheme(newTheme);
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [isInitialized, applyTheme]);

  return { theme, setTheme: setThemeAndSave, isInitialized };
};
