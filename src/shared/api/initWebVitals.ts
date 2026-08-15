import { reportWebVital } from "./telemetry";

export const initWebVitals = () => {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  // 1. TTFB (Time to First Byte)
  try {
    const navEntries = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      const ttfb = navEntries[0].responseStart;
      if (ttfb > 0) {
        const rating = ttfb <= 800 ? "good" : ttfb <= 1800 ? "needs-improvement" : "poor";
        reportWebVital({ name: "TTFB", value: Math.round(ttfb), rating });
      }
    }
  } catch {
    // ignore
  }

  // 2. FCP (First Contentful Paint)
  try {
    const fcpObserver = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          const val = Math.round(entry.startTime);
          const rating = val <= 1800 ? "good" : val <= 3000 ? "needs-improvement" : "poor";
          reportWebVital({ name: "FCP", value: val, rating });
          fcpObserver.disconnect();
          break;
        }
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });
  } catch {
    // ignore
  }

  // 3. LCP (Largest Contentful Paint)
  try {
    let latestLcp = 0;
    const lcpObserver = new PerformanceObserver(entryList => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        latestLcp = Math.round(entries[entries.length - 1].startTime);
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    const sendLcp = () => {
      if (latestLcp > 0) {
        const rating = latestLcp <= 2500 ? "good" : latestLcp <= 4000 ? "needs-improvement" : "poor";
        reportWebVital({ name: "LCP", value: latestLcp, rating });
        latestLcp = 0;
      }
    };
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendLcp();
    });
    window.addEventListener("pagehide", sendLcp);
  } catch {
    // ignore
  }

  // 4. CLS (Cumulative Layout Shift)
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries() as (PerformanceEntry & {
        hadRecentInput?: boolean;
        value?: number;
      })[]) {
        if (!entry.hadRecentInput && typeof entry.value === "number") {
          clsValue += entry.value;
        }
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });

    const sendCls = () => {
      if (clsValue > 0) {
        const rounded = Number(clsValue.toFixed(3));
        const rating = rounded <= 0.1 ? "good" : rounded <= 0.25 ? "needs-improvement" : "poor";
        reportWebVital({ name: "CLS", value: rounded, rating });
        clsValue = 0;
      }
    };
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendCls();
    });
    window.addEventListener("pagehide", sendCls);
  } catch {
    // ignore
  }

  // 5. INP (Interaction to Next Paint)
  try {
    let maxDuration = 0;
    const inpObserver = new PerformanceObserver(entryList => {
      for (const entry of entryList.getEntries()) {
        if (entry.duration > maxDuration) {
          maxDuration = Math.round(entry.duration);
        }
      }
    });
    inpObserver.observe({ type: "first-input", buffered: true });

    const sendInp = () => {
      if (maxDuration > 0) {
        const rating = maxDuration <= 200 ? "good" : maxDuration <= 500 ? "needs-improvement" : "poor";
        reportWebVital({ name: "INP", value: maxDuration, rating });
        maxDuration = 0;
      }
    };
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") sendInp();
    });
    window.addEventListener("pagehide", sendInp);
  } catch {
    // ignore
  }
};
