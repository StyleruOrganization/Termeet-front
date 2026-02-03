import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./TableCell.module.css";
import type { TableCellProps } from "./TableCell.types";

export const TableCell = ({ id, isSelected }: TableCellProps) => {
  // Используем useCallback для сохранения ссылок на функции
  // const handlePointerMove = useCallback(
  //   e => {
  //     console.log("pointer move in TableCell", isSelectedSession.current, content);
  //     if (isSelecting && isSelectedSession.current) {
  //       isSelectedSession.current = false;
  //       setIsSelected(!isRemoving);
  //     }
  //   },
  //   [isSelecting, isRemoving, content],
  // );

  // const handlePointerUp = useCallback(
  //   e => {
  //     console.log("pointer up in TableCell", isSelectedSession.current, content);
  //     if (isSelectedSession.current) {
  //       setIsSelected(selected => !selected);
  //       isSelectedSession.current = false;
  //     }
  //   },
  //   [content],
  // );

  // const handlePointerDown = useCallback(
  //   e => {
  //     console.log("pointer down in TableCell", content);
  //     onSelectStart({ isRemoving: isSelected });
  //   },
  //   [onSelectStart, isSelected, content],
  // );

  // useEffect(() => {
  //   isSelectedSession.current = isSelecting;
  //   console.log(isSelecting, "in UseEffect");
  // }, [isSelecting]);

  // useEffect(() => {
  //   const span = spanRef.current;
  //   if (!span) return;

  //   const handleTouchStart = (e: TouchEvent) => {
  //     e.preventDefault();
  //     console.log("touchstart in TableCell");
  //     handlePointerDown(e);
  //   };

  //   const handleTouchMove = (e: TouchEvent) => {
  //     e.preventDefault();
  //     console.log("touchmove in TableCell");
  //     handlePointerMove(e);
  //   };

  //   const handleTouchEnd = (e: TouchEvent) => {
  //     e.preventDefault();
  //     console.log("touchend in TableCell");
  //     handlePointerUp(e);
  //   };

  //   span.addEventListener("touchstart", handleTouchStart, { passive: false });
  //   span.addEventListener("touchmove", handleTouchMove, { passive: false });
  //   span.addEventListener("touchend", handleTouchEnd, { passive: false });

  //   return () => {
  //     span.removeEventListener("touchstart", handleTouchStart);
  //     span.removeEventListener("touchmove", handleTouchMove);
  //     span.removeEventListener("touchend", handleTouchEnd);
  //   };
  // }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  return (
    <span
      data-id={id}
      onTouchMove={() => {
        console.log("onTouchMove in TableCell", id);
      }}
      // ref={spanRef}
      // onPointerMove={handlePointerMove}
      // onPointerDown={handlePointerDown}
      // onPointerUp={handlePointerUp}
      className={styles.TableCell + (isSelected ? " " + styles.TableCell_selected : "")}
    >
      {id}
    </span>
  );
};
