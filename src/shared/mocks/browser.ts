import { setupWorker } from "msw/browser";
import { meetHandlers } from "./Meet/meetHandlers";
import type { HttpHandler } from "msw";

export const launchWorker = async (handlers: HttpHandler[] = meetHandlers) => {
  const worker = setupWorker(...handlers);
  await worker.start();
};
