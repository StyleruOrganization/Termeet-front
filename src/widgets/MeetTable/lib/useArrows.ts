import { useCallback, useState } from "react";

export function useArrows(columnsContainerRef: React.RefObject<HTMLDivElement | null>, columnWidth: number) {
  const [arrowsState, setArrowsState] = useState({
    leftActive: false,
    rightActive: false,
  });

  const updateArrows = useCallback(() => {
    if (!columnsContainerRef.current) return;

    const columnContainer = columnsContainerRef.current;
    const { scrollLeft, scrollWidth, clientWidth } = columnContainer;

    const tolerance = 5;
    const hasSpaceLeft = scrollLeft > tolerance;
    const hasSpaceRight = scrollLeft + clientWidth < scrollWidth - tolerance;

    setArrowsState(prev => {
      if (prev.leftActive === hasSpaceLeft && prev.rightActive === hasSpaceRight) {
        return prev;
      }

      return {
        leftActive: hasSpaceLeft,
        rightActive: hasSpaceRight,
      };
    });
  }, [columnsContainerRef]);

  // Обработчики прокрутки
  const onScrollLeft = () => {
    console.log("scrollLeft");
    if (!columnsContainerRef.current) return;
    const columnContainerEl = columnsContainerRef.current;

    // Делаем подскролл к ближайшему левому столбцу
    let scrollDistance = 0;
    if (Math.floor(columnContainerEl.scrollLeft) % columnWidth === 0) {
      scrollDistance = -columnWidth;
    } else {
      scrollDistance = -(
        columnContainerEl.scrollLeft -
        Math.floor(Math.floor(columnContainerEl.scrollLeft) / columnWidth) * columnWidth
      );
    }

    columnsContainerRef.current.scrollBy({ left: scrollDistance, behavior: "smooth" });
  };

  const onScrollRight = () => {
    console.log("scrollRight");
    if (!columnsContainerRef.current) return;
    const columnContainerEl = columnsContainerRef.current;
    // Делаем подскролл к ближайшему правому столбцу
    console.log("scrollRight", "scrollRight", columnContainerEl.scrollLeft, "columnWidth", columnWidth);

    let scrollDistance = 0;
    if (Math.ceil(columnContainerEl.scrollLeft) % columnWidth === 0) {
      scrollDistance = columnWidth;
    } else {
      scrollDistance =
        (Math.floor(Math.floor(columnContainerEl.scrollLeft) / columnWidth) + 1) * columnWidth -
        columnContainerEl.scrollLeft;
    }

    console.log("scrollDistance", scrollDistance);

    columnsContainerRef.current.scrollBy({ left: scrollDistance, behavior: "smooth" });
  };

  return {
    onScrollLeft,
    onScrollRight,
    updateArrows,
    arrowsState,
  };
}
