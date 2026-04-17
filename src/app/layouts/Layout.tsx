import { Outlet, useNavigate } from "react-router";
import { useTheme } from "@/shared/libs";
import { Toggle } from "@/shared/ui";
import MoonIcon from "@assets/icons/moon.svg";
import SunIcon from "@assets/icons/sun.svg";
import styles from "./Layout.module.css";

// Global Styles
import "../styles/reset.css";
import "../styles/global.css";
import "../styles/fonts.css";
import "../styles/variables.css";

export const Layout = () => {
  const navigate = useNavigate();
  const { theme, setTheme, isInitialized } = useTheme();

  if (!isInitialized) {
    console.error("Theme is not initialized");
    return null;
  }

  return (
    <>
      <div className={styles.headerContainer}>
        <div className={styles.header}>
          <button
            onClick={() => {
              navigate("/");
            }}
          >
            <h1 className={styles.header__title}>termeet</h1>
          </button>
          <Toggle
            className={styles.toogleTheme}
            classNameActive={styles.activeTheme}
            classNameOptions={styles.themeOption}
            LeftLabel={<MoonIcon />}
            RightLabel={<SunIcon />}
            onChange={value => {
              const newTheme = value === "left" ? "dark" : "light";
              setTheme(newTheme);
            }}
            defaultActive={theme == "dark" ? "left" : "right"}
          />
        </div>
      </div>
      <div className={styles.container}>
        <Outlet />
      </div>
    </>
  );
};
