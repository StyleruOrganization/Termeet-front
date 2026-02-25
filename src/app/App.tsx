import { QueryClientProvider } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter as Router } from "react-router";
import { queryClient } from "@shared/api";
import { Routes } from "./routes/routes";

// Global Styles
import "./styles/reset.css";
import "./styles/global.css";
import "./styles/fonts.css";
import "./styles/variables.css";

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes />
      </Router>
      {/* <ReactQueryDevtools /> */}
    </QueryClientProvider>
  );
};
