import { Outlet, useLocation, useNavigate } from "react-router";
import { useSessionStore } from "@/entities/User";
import { LoginForm, useActiveSectionStore } from "@/pages/Entry";
import { useLoginModalStore } from "@/shared/libs";
import { ModalWrapper } from "@/shared/ui";
import { useToastStore } from "@features/ToastContainer";
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
  const { isOpen, open, close } = useLoginModalStore();
  const { activeSection } = useActiveSectionStore();
  const user = useSessionStore(state => state.user);
  const logout = useSessionStore(state => state.logout);
  const addToast = useToastStore(state => state.addToast);

  const handleLogout = async () => {
    await logout();
    addToast({
      id: "logout-success",
      type: "info",
      message: "Вы вышли из аккаунта",
    });
  };

  return (
    <>
      <div
        id='intro'
        className={styles.headerContainer}
        style={{
          position: pathname == "/" ? "sticky" : "static",
        }}
      >
        <header
          style={{
            padding: pathname == "/" ? "16px 16px 0px" : "16px",
          }}
        >
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
              <a className={activeSection == "features" ? styles.activeAnchor : ""} href='#features'>
                Удобства
              </a>
              <a className={activeSection == "advantages" ? styles.activeAnchor : ""} href='#advantages'>
                Возможности
              </a>
              <a className={activeSection == "team" ? styles.activeAnchor : ""} href='#team-info'>
                О нас
              </a>
            </div>
          )}

          <div className={styles.header__groupButtons}>
            {user ? (
              <>
                <button className={`${styles.header__loginBtn} baseButton outlineButton`} onClick={handleLogout}>
                  Выйти
                </button>
                <span className={styles.header__userName}>
                  {user.first_name} {user.last_name}
                </span>
              </>
            ) : (
              <button className={`${styles.header__loginBtn} baseButton mainButton`} onClick={open}>
                Войти или зарегистрироваться
              </button>
            )}

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
