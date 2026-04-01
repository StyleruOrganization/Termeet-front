import { useEffect, useMemo, useRef, useState, memo } from "react";
import { MONTHS_GENITIVE } from "@/shared/libs";
import styles from "./TableColumn.module.css";
import { getCellIds, useColumnData } from "../../lib";
import { TableCell } from "../TableCell/TableCell";
import type { TableColumnProps } from "./TableColumn.types";

export const TableColumn = memo(({ columnId, columnWidth, timeRanges }: TableColumnProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);
  const { cellIds, userSlots, newSelectedSlots, isEditing, setSelectNewSell, isShowAfter, isShowBefore } =
    useColumnData(columnId);

  const date = useMemo(() => {
    const partsOfDate = columnId.split("-").map(Number);
    const month = partsOfDate[1],
      day = partsOfDate[2];
    return day + " " + MONTHS_GENITIVE.at(month - 1);
  }, [columnId]);

  const disabledBeforeCells = useMemo(() => {
    return getCellIds({
      startTime: timeRanges[0][0],
      endTime: timeRanges[0][1],
      date: columnId,
    });
  }, [timeRanges, columnId]);

  const disabledAfterCells = useMemo(() => {
    return getCellIds({
      startTime: timeRanges[1]?.[0],
      endTime: timeRanges[1]?.[1],
      date: columnId,
    });
  }, [columnId, timeRanges]);

  // предотвращаем багулю с завершением выделения за пределами таблицы
  useEffect(() => {
    const handleEndSelection = () => {
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

    if (isEditing) {
      columnEl.style.touchAction = "pan-x";
    } else {
      columnEl.style.touchAction = "auto";
    }
  }, [isEditing]);

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = e => {
    if (!isEditing) return;
    e.preventDefault();
    const element = e.target as Element;
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
    if (!isEditing) return;
    e.preventDefault();
    if (!isSelecting) return;

    const cell = document.elementFromPoint(e.clientX, e.clientY);
    const dataId = cell?.getAttribute("data-id")?.split("T")[1];
    if (!dataId) return;

    if (isRemoving && newSelectedSlots?.includes(dataId)) {
      setSelectNewSell(columnId, dataId, true);
    } else if (!isRemoving && !newSelectedSlots?.includes(dataId)) {
      setSelectNewSell(columnId, dataId);
    }
  };

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = e => {
    if (!isEditing) return;
    e.preventDefault();
    setIsSelecting(false);
    setIsRemoving(false);
  };

  const justifyContent = cellIds?.length == 0 ? (isShowBefore.isShow ? "start" : isShowAfter.isShow ? "end" : "") : "";

  return (
    <>
      <span className={styles.TableColumnTitle}>{date}</span>
      <div style={{ width: `${columnWidth}px`, justifyContent }} className={styles.TableColumn} ref={columnRef}>
        <div className={styles.TableColumnRange}>
          {/* Фейковые слоты перед основным диапазона */}
          {isShowBefore.isShow && (
            <>
              {disabledBeforeCells.map((cellId, cellIndex) => (
                <TableCell
                  columnRef={columnRef}
                  isLastCell={false}
                  isFirstCell={cellIndex == 0}
                  id={cellId}
                  key={cellId}
                  isDisabled
                />
              ))}
              <TableCell
                isLastCell={cellIds?.length == 0 && isShowAfter.isShow == false}
                isFirstCell={disabledBeforeCells.length == 0}
                id={"disabled-cell"}
                isDisabled
                columnRef={columnRef}
              />
            </>
          )}

          {cellIds?.map((cellsRange, indexRanges) => (
            <div
              key={indexRanges}
              className={styles.TableColumnActiveRange}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {cellsRange.map((cell, cellIndex) => {
                const key = cell.split("T")[1];
                const selectedPersons = userSlots?.get(key) || [];
                return (
                  <TableCell
                    columnRef={columnRef}
                    isFirstCell={!isShowBefore.isShow && indexRanges == 0 && cellIndex == 0}
                    isLastCell={
                      indexRanges == cellIds.length - 1 &&
                      cellIndex == cellsRange.length - 1 &&
                      isShowAfter.isShow == false
                    }
                    id={cell}
                    key={cell}
                    users={selectedPersons}
                  />
                );
              })}
              {indexRanges < cellIds.length - 1 && (
                <TableCell
                  columnRef={columnRef}
                  isLastCell={false}
                  isFirstCell={false}
                  id={"disabled-cell"}
                  isDisabled
                />
              )}
            </div>
          ))}

          {/* Фейковые слоты после активного диапазона */}
          {isShowAfter.isShow && (
            <>
              <TableCell columnRef={columnRef} isLastCell={false} isFirstCell={false} id={"disabled-cell"} isDisabled />
              {disabledAfterCells.map((cellId, cellIndex) => (
                <TableCell
                  columnRef={columnRef}
                  isFirstCell={false}
                  isLastCell={cellIndex == disabledAfterCells.length - 1}
                  id={cellId}
                  key={cellId}
                  isDisabled
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
});
