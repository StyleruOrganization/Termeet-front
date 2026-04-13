import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter as Router } from "react-router";
import { useTheme } from "@/shared/libs";
import { Loader } from "@/shared/ui";
import { Stub } from "@pages/Stub";
import { queryClient } from "@shared/api";
import { ScrollRestoration } from "./providers/ScrollRestoration";
import { Routing } from "./routes/routes";

import "./styles/reset.css";
import "./styles/global.css";
import "./styles/variables.css";

export const App = () => {
  useTheme();
  return (
    <ErrorBoundary
      fallbackRender={() => (
        <>
          <Stub message='Что-то пошло не так' />
        </>
      )}
    >
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<Loader message='Загрузка ...' />}>
          <Router>
            <ScrollRestoration />
            <Routing />
          </Router>
        </Suspense>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </ErrorBoundary>
  );
};
