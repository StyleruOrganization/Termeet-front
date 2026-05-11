import { Outlet, useLocation, useNavigate } from "react-router";
import { LoginForm } from "@/pages/Entry/ui/LoginForm/LoginForm";
import { useTheme } from "@/shared/libs";
import { useLoginModalStore } from "@/shared/libs/store/useLoginModalStore";
import { ModalWrapper, Toggle } from "@/shared/ui";
import MoonIcon from "@assets/icons/moon.svg";
import SunIcon from "@assets/icons/sun.svg";
import styles from "./Layout.module.css";

// Global Styles
import "../styles/reset.css";
import "../styles/global.css";
import "../styles/fonts.css";
import "../styles/variables.css";

const WINDOW_WIDTH = window.innerWidth;

export const Layout = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();
  const { isOpen, open, close } = useLoginModalStore();

  return (
    <>
      <div id='intro' className={styles.headerContainer}>
        <header>
          <button
            onClick={() => {
              navigate("/");
            }}
            className={styles.header__logoBtn}
          >
            <h1
              style={{
                width: pathname == "/" && WINDOW_WIDTH >= 1024 ? "202px" : "",
              }}
              className={styles.header__title}
            >
              termeet
            </h1>
          </button>
          {/* {pathname == "/" && WINDOW_WIDTH < 1024 ? (
            <Toggle
              className={styles.toogleTheme}
              classNameActive={styles.activeTheme}
              classNameOption={styles.themeOption}
              LeftLabel={<MoonIcon />}
              RightLabel={<SunIcon />}
              onChange={value => {
                const newTheme = value === "left" ? "dark" : "light";
                setTheme(newTheme);
              }}
              defaultActive={theme == "dark" ? "left" : "right"}
            />
          ) : null} */}
          {pathname == "/" && (
            <div className={styles.header__groupAnchors}>
              <a href='#features'>Удобства</a>
              <a href='#advantages'>Возможности</a>
              <a>О нас</a>
            </div>
          )}

          <div className={styles.header__groupButtons}>
            <button className={`${styles.header__loginBtn} baseButton mainButton`} onClick={open}>
              Войти или зарегистрироваться
            </button>

            {/* {(WINDOW_WIDTH >= 1024 || pathname != "/") && (
              <Toggle
                className={styles.toogleTheme}
                classNameActive={styles.activeTheme}
                classNameOption={styles.themeOption}
                LeftLabel={<MoonIcon />}
                RightLabel={<SunIcon />}
                onChange={value => {
                  const newTheme = value === "left" ? "dark" : "light";
                  setTheme(newTheme);
                }}
                defaultActive={theme == "dark" ? "left" : "right"}
              />
            )} */}
          </div>
        </header>
      </div>
      <>
        <Outlet />
      </>

      <ModalWrapper isOpen={isOpen} onClose={close}>
        <LoginForm />
      </ModalWrapper>
    </>
  );
};
