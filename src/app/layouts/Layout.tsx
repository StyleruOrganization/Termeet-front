import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useSessionStore } from "@/entities/User";
import { LoginForm, useActiveSectionStore } from "@/pages/Entry";
import { useLoginModalStore } from "@/shared/libs";
import { ModalWrapper } from "@/shared/ui";
import UserIcon from "@assets/icons/user.svg";
import styles from "./Layout.module.css";

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
  const status = useSessionStore(state => state.status);
  const sessionReady = status === "authenticated" || status === "anonymous";
  const isLanding = pathname === "/" && !user;

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
          {isLanding ? (
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
          ) : null}

          <div className={styles.header__groupButtons}>
            {!sessionReady ? (
              <span className={styles.header__authPlaceholder} aria-hidden />
            ) : user ? (
              <Link to='/profile' className={styles.header__profileLink}>
                <span className={styles.header__userName}>{user.first_name}</span>
                <UserIcon className={styles.header__userIcon} />
              </Link>
            ) : (
              <button className={`${styles.header__loginBtn} baseButton mainButton`} onClick={open}>
                Войти или зарегистрироваться
              </button>
            )}
          </div>
        </header>
      </div>
      <Outlet />

      <ModalWrapper isOpen={isOpen} onClose={close}>
        <LoginForm />
      </ModalWrapper>
    </>
  );
};
