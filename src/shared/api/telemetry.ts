export interface ClientErrorPayload {
  message: string;
  stack?: string;
  componentStack?: string;
  href?: string;
  pathname?: string;
  viewport?: string;
  userAgent?: string;
  userId?: string;
  type?: "client_error" | "unhandled_rejection" | "react_error_boundary";
}

export interface WebVitalMetric {
  name: "LCP" | "FCP" | "CLS" | "INP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor" | "unknown";
  delta?: number;
  id?: string;
}

export const sendTelemetry = (payload: Record<string, unknown>) => {
  const isBrowser = typeof window !== "undefined";
  const body = JSON.stringify({
    ...payload,
    href: payload.href ?? (isBrowser ? window.location.href : ""),
    pathname: payload.pathname ?? (isBrowser ? window.location.pathname : ""),
    viewport: payload.viewport ?? (isBrowser ? `${window.innerWidth}x${window.innerHeight}` : ""),
    userAgent: isBrowser ? navigator.userAgent : "",
    ts: Date.now(),
  });

  try {
    if (isBrowser && navigator.sendBeacon) {
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

export const reportClientError = (payload: ClientErrorPayload) => {
  sendTelemetry({
    type: payload.type || "client_error",
    message: payload.message,
    stack: payload.stack,
    componentStack: payload.componentStack,
    href: payload.href,
    pathname: payload.pathname,
    viewport: payload.viewport,
    userAgent: payload.userAgent,
    userId: payload.userId,
  });
};

export const reportWebVital = (metric: WebVitalMetric) => {
  sendTelemetry({
    type: "web_vital",
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
  });
};
