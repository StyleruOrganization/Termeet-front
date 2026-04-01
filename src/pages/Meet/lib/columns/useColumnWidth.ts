import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { debounce } from "@/shared/libs";

const BREAKPOINT_MOBILE = 768;
const MIN_WIDTH_COLUMN = 92;
const MIN_WIDTH_COLUMN_MOBILE = 72;

function getMinColumnWidth(containerWidth: number): number {
  const isMobile = containerWidth <= BREAKPOINT_MOBILE;
  return isMobile ? MIN_WIDTH_COLUMN_MOBILE : MIN_WIDTH_COLUMN;
}

function computeColumnWidth(containerWidth: number, daysCount: number) {
  if (daysCount === 0)
    return {
      columnWidth: 0,
      daysVisible: 0,
    };
  const minWidth = getMinColumnWidth(containerWidth);
  let columnWidth = 0;
  if (containerWidth / daysCount < minWidth) {
    // Хотим чтобы пол дня которые не убираются были видны
    const countVisible = Math.min(daysCount, Math.floor(containerWidth / minWidth));
    columnWidth = (containerWidth - minWidth / 2) / countVisible;
  } else {
    columnWidth = containerWidth / daysCount;
  }
  return {
    columnWidth,
  };
}

export function useColumnWidth(meeting_days: string[]) {
  const daysCount = meeting_days.length;
  const [columnWidth, setColumnWidth] = useState(() =>
    daysCount > 0 ? computeColumnWidth(document.documentElement.clientWidth, daysCount).columnWidth : 0,
  );
  const measureContainerRef = useRef<HTMLDivElement>(null);

  const calculateColumnWidth = useCallback(() => {
    const el = measureContainerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const { columnWidth } = computeColumnWidth(w, daysCount);
    setColumnWidth(columnWidth);
  }, [daysCount]);

  useLayoutEffect(() => {
    const el = measureContainerRef.current;
    if (!el) return;

    const debouncedCalc = debounce(calculateColumnWidth, 150);

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const w = entry.contentRect.width;
      if (w > 0) debouncedCalc();
    });

    observer.observe(el);
    calculateColumnWidth();

    return () => {
      observer.disconnect();
    };
  }, [calculateColumnWidth]);

  return {
    calculateColumnWidth,
    measureContainerRef,
    columnWidth,
  };
}
