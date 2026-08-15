interface ClientErrorPayload {
  message: string;
  stack?: string;
  href?: string;
}

export interface WebVitalMetric {
  name: "LCP" | "FCP" | "CLS" | "INP" | "TTFB";
  value: number;
  rating: "good" | "needs-improvement" | "poor" | "unknown";
  delta?: number;
  id?: string;
}

export const sendTelemetry = (payload: Record<string, unknown>) => {
  const body = JSON.stringify({
    ...payload,
    href: payload.href ?? (typeof window !== "undefined" ? window.location.href : ""),
    ts: Date.now(),
  });

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
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
    type: "client_error",
    message: payload.message,
    stack: payload.stack,
    href: payload.href,
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
