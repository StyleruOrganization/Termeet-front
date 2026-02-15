import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "@/shared/libs";

const BREAKPOINT_MOBILE = 768;
const PERCENT_MIN_WIDTH_COLUMN = 15;
const PERCENT_MIN_WIDTH_COLUMN_MOBILE = 30;

function getMinColumnWidth(containerWidth: number): number {
  const isMobile = containerWidth <= BREAKPOINT_MOBILE;
  const percent = isMobile ? PERCENT_MIN_WIDTH_COLUMN_MOBILE : PERCENT_MIN_WIDTH_COLUMN;
  return Math.floor((containerWidth * percent) / 100);
}

function computeColumnWidth(containerWidth: number, daysCount: number) {
  if (daysCount === 0)
    return {
      columnWidth: 0,
      daysVisible: 0,
    };
  const minWidth = getMinColumnWidth(containerWidth);
  const countVisible = Math.min(Math.floor(containerWidth / minWidth) || 1, daysCount);
  return {
    columnWidth: Math.floor(containerWidth / countVisible),
    daysVisible: countVisible,
  };
}

export function useColumnWidth(meeting_days: string[]) {
  const daysCount = meeting_days.length;
  const [columnWidth, setColumnWidth] = useState(() =>
    daysCount > 0 ? computeColumnWidth(document.documentElement.clientWidth, daysCount).columnWidth : 0,
  );
  const [daysVisible, setDaysVisible] = useState(0);
  const columnContainerRef = useRef<HTMLDivElement>(null);
  const measureContainerRef = useRef<HTMLDivElement>(null);

  const calculateColumnWidth = useCallback(() => {
    const el = measureContainerRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const { columnWidth: cw, daysVisible: dv } = computeColumnWidth(w, daysCount);
    setColumnWidth(cw);
    setDaysVisible(dv);
  }, [daysCount]);

  useEffect(() => {
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
    columnContainerRef,
    measureContainerRef,
    columnWidth,
    daysVisible,
  };
}
