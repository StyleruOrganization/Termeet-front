import { Outlet } from "react-router";
import { Header } from "@/components/Header";
import styles from "./App.module.css";

export const App = () => {
  return (
    <>
      <Header />
      <div className={styles.MainContainer}>
        <Outlet />
      </div>
    </>
  );
};
