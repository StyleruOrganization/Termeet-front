import { Outlet, useLocation, useNavigate } from "react-router";
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
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <div className={styles.headerContainer} data-test-id='layout-header'>
        <header>
          <button
            onClick={() => {
              navigate("/");
            }}
          >
            <h1 className={styles.header__title}>termeet</h1>
          </button>
          {pathname == "/" && (
            <div className={styles.header__groupAnchors}>
              <span>Удобства</span>
              <span>Возможности</span>
              <span>О нас</span>
            </div>
          )}

          <button className={`${styles.header__loginBtn} baseButton mainButton `}>Войти или зарегистрироваться</button>
          {pathname != "/" && (
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
          )}
        </header>
      </div>
      <>
        <Outlet />
      </>
    </>
  );
};
