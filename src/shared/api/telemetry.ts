interface ClientErrorPayload {
  message: string;
  stack?: string;
  href?: string;
}

export const reportClientError = (payload: ClientErrorPayload) => {
  const body = JSON.stringify({
    type: "client_error",
    message: payload.message,
    stack: payload.stack,
    href: payload.href ?? window.location.href,
    ts: Date.now(),
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/telemetry", new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    // ignore
  }

  fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => undefined);
};
