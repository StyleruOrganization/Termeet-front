import { Suspense } from "react";
import { Outlet, useNavigate } from "react-router";
import { ToastContainer } from "@/features/ToastContainer";
import { Loader } from "@/shared/ui";
import styles from "./Layout.module.css";

// Global Styles
import "../styles/reset.css";
import "../styles/global.css";
import "../styles/fonts.css";
import "../styles/variables.css";

export const Layout = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className={styles.header}>
        <button
          onClick={() => {
            navigate("/");
          }}
        >
          <h1 className={styles.header__title}>termeet</h1>
        </button>
      </div>
      <div className={styles.container}>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
        <ToastContainer />
      </div>
    </>
  );
};
