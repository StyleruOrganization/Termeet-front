import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { BrowserRouter as Router } from "react-router";
import { useTheme } from "@/shared/libs";
import { Loader } from "@/shared/ui";
import { queryClient } from "@shared/api";
import { ScrollRestoration } from "./providers/ScrollRestoration";
import { Routing } from "./routes/routes";

import "./styles/reset.css";
import "./styles/global.css";
import "./styles/variables.css";

export const App = () => {
  useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<Loader message='Загрузка ...' />}>
        <Router>
          <ScrollRestoration />
          <Routing />
        </Router>
      </Suspense>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};
