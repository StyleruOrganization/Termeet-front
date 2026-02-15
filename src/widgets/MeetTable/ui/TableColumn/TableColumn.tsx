import { useEffect, useMemo, useRef, useState, memo } from "react";
import { MONTHS_GENITIVE } from "@/shared/libs/dates/const";
import { useColumnData } from "./lib/useColumnData";
import styles from "./TableColumn.module.css";
import { TableCell } from "../TableCell/TableCell";
import type { TableColumnProps } from "./TableColumn.types";

export const TableColumn = memo(({ cellIds, columnId, columnWidth }: TableColumnProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);
  const { columnData, newSelectedSlots, isEditing, setSelectNewSell, maxSelectCount, hoveredUser } =
    useColumnData(columnId);

  const date = useMemo(() => {
    const partsOfDate = columnId.split("-").map(Number);
    const month = partsOfDate[1],
      day = partsOfDate[2];
    return day + " " + MONTHS_GENITIVE.at(month - 1);
  }, [columnId]);

  useEffect(() => {
    // Завершаем выделение, после того как отпустили указатель за пределами
    const handleEndSelection = () => {
      console.log("DEBUG: End selection in window");
      setIsSelecting(false);
    };
    window.addEventListener("pointerup", handleEndSelection);

    return () => {
      window.removeEventListener("pointerup", handleEndSelection);
    };
  }, []);

  useEffect(() => {
    const columnEl = columnRef.current;
    if (!columnEl) return;
    // Для мобилок чтобы норм выделялось
    if (isEditing) {
      columnEl.style.touchAction = "pan-x";
    } else {
      columnEl.style.touchAction = "auto";
    }
  }, [isEditing]);

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = e => {
    if (!isEditing) return;
    console.log("DEBUG: handleDown in TableColumn", "isEditing", isEditing, "isSelecting", isSelecting);

    e.preventDefault();
    const element = e.target as Element;
    console.log(element, e.target);
    const dataId = element?.getAttribute("data-id")?.split("T")[1];
    if (!element || !dataId) return;

    setIsSelecting(true);
    if (newSelectedSlots?.includes(dataId)) {
      setIsRemoving(true);
      setSelectNewSell(columnId, dataId, true);
    } else {
      setSelectNewSell(columnId, dataId);
    }
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = e => {
    console.log("DEBUG: handleMove in TableColumn", "isEditing", isEditing, "isSelecting", isSelecting);
    if (!isEditing) return;

    e.preventDefault();
    if (!isSelecting) return;
    const element = document.elementFromPoint(e.clientX, e.clientY);
    const dataId = element?.getAttribute("data-id")?.split("T")[1];
    if (!element || !dataId) return;
    if (isRemoving && newSelectedSlots?.includes(dataId)) {
      setSelectNewSell(columnId, dataId, true);
    } else if (!isRemoving && !newSelectedSlots?.includes(dataId)) {
      setSelectNewSell(columnId, dataId);
    }
    console.log("PointerMove in touchCollumn", dataId, "isRemoving", isRemoving);
  };

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = e => {
    if (!isEditing) return;

    console.log("DEBUG: handleUp in TableColumn ");

    e.preventDefault();
    console.log("PointerEnd in touchColumn");
    setIsSelecting(false);
    setIsRemoving(false);
  };

  return (
    <>
      <span className={styles.TableColumnTitle}>{date}</span>
      <div
        style={{ width: `${columnWidth}px` }}
        ref={columnRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          console.log("PointerLeave in TableColumn", columnId);
        }}
        className={styles.TableColumn}
      >
        {cellIds.map((cell, index) => {
          const key = cell.split("T")[1];
          const selectedPersons = columnData?.get(key) || [];
          return (
            <TableCell
              id={cell}
              key={index}
              opacityPercent={
                hoveredUser
                  ? selectedPersons.includes(hoveredUser)
                    ? 100
                    : 0
                  : newSelectedSlots?.includes(key)
                    ? 100
                    : ((selectedPersons.length || 0) / (maxSelectCount || 1)) * 100
              }
              users={selectedPersons}
              isSelected={
                (Boolean(selectedPersons) && !isEditing) ||
                Boolean(newSelectedSlots?.includes(key) || selectedPersons.includes(hoveredUser))
              }
            />
          );
        })}
      </div>
    </>
  );
});
