import { BrowserRouter as Router, Outlet } from "react-router";
import { Header } from "@shared/ui";
import styles from "./layouts/Layout.module.css";
import { Routes } from "./routes/routes";

// Global Styles
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/fonts.css";
import "./styles/variables.css";

export const App = () => {
  return (
    <Router>
      <Routes />
    </Router>
  );
};

export const Layout = () => (
  <>
    <Header />
    <div className={styles.MainContainer}>
      <Outlet />
    </div>
  </>
);
