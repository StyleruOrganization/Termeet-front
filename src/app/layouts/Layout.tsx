import { Outlet } from "react-router";
import { Header } from "@shared/ui";
import styles from "./Layout.module.css";

// Global Styles
import "../styles/reset.css";
import "../styles/global.css";
import "../styles/fonts.css";
import "../styles/variables.css";

export const Layout = () => (
  <>
    <Header />
    <div className={styles.MainContainer}>
      <Outlet />
    </div>
  </>
);
