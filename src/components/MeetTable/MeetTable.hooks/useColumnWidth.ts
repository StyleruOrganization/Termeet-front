import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "@/shared/utils/helpers";

const PERCENT_MIN_WIDTH_COLUMN = 13;
const PERCENT_MIN_WIDTH_COLUMN_MOBILE = 20;

export function useColumnWidth(meeting_days: string[]) {
  const [windowWidth, setWindowWidth] = useState(document.documentElement.clientWidth);
  const [columnWidth, setColumnWidth] = useState<number>(
    windowWidth < 640
      ? (windowWidth * PERCENT_MIN_WIDTH_COLUMN_MOBILE) / 100
      : (windowWidth * PERCENT_MIN_WIDTH_COLUMN) / 100,
  );
  const columnContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Функция обработки изменения размера
    const handleResize = () => {
      setWindowWidth(document.documentElement.clientWidth);
    };

    const debouncedHandleResize = debounce(handleResize, 200);

    window.addEventListener("resize", debouncedHandleResize);

    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, []);

  const calculateColumnWidth = useCallback(() => {
    const columnContainerEl = columnContainerRef.current;
    if (!columnContainerEl) return;
    const minColumnWidth =
      windowWidth < 640
        ? (windowWidth * PERCENT_MIN_WIDTH_COLUMN_MOBILE) / 100
        : (windowWidth * PERCENT_MIN_WIDTH_COLUMN) / 100;
    const countVisibleColumns = Math.min(
      Math.floor(columnContainerEl.clientWidth / minColumnWidth),
      meeting_days.length,
    );
    const columnWidth = Math.floor(columnContainerEl.clientWidth / countVisibleColumns);
    setColumnWidth(columnWidth);
  }, [windowWidth, meeting_days]);

  return {
    calculateColumnWidth,
    columnContainerRef,
    columnWidth,
  };
}
