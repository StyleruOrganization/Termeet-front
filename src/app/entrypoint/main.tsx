import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { reportClientError } from "@/shared/api";
import "@/shared/i18n";
import { App } from "../App";

window.addEventListener("error", event => {
  reportClientError({ message: event.message, stack: event.error instanceof Error ? event.error.stack : undefined });
});

window.addEventListener("unhandledrejection", event => {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : undefined;
  reportClientError({ message, stack });
});

async function startApp() {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

startApp();
