import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { launchWorker } from "@shared/mocks/browser";
import { App } from "../App";

async function startApp() {
  await launchWorker();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

startApp();
