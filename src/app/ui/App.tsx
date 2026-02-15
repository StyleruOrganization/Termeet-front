import { BrowserRouter as Router } from "react-router";
import { Routes } from "../routes/routes";

export const App = () => {
  return (
    <Router>
      <Routes />
    </Router>
  );
};
