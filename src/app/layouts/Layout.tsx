import { Suspense } from "react";
import { Outlet } from "react-router";
import { ToastContainer } from "@/features/ToastContainer";
import { Loader } from "@/shared/ui";
import styles from "./Layout.module.css";

// Global Styles
import "../styles/reset.css";
import "../styles/global.css";
import "../styles/fonts.css";
import "../styles/variables.css";

export const Layout = () => (
  <>
    <h1 className={styles.header}>termeet</h1>
    <div className={styles.container}>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
      <ToastContainer />
    </div>
  </>
);
