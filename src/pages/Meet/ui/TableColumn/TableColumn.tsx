import { useEffect, useMemo, useRef, useState, memo } from "react";
import { MONTHS_GENITIVE } from "@/shared/libs";
import styles from "./TableColumn.module.css";
import { getCellIds, useColumnData } from "../../lib";
import { TableCell } from "../TableCell/TableCell";
import type { TableColumnProps } from "./TableColumn.types";

interface ICoords {
  initialX: number;
  initialY: number;
}

export const TableColumn = memo(({ columnId, columnWidth, timeRanges }: TableColumnProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [initialCoords, setInitialCoords] = useState<ICoords>();
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
    console.log("handlePointerDown");
    if (!isEditing) return;
    e.preventDefault();
    const cell = document.elementFromPoint(e.clientX, e.clientY);
    const dataId = cell?.getAttribute("data-id")?.split("T")[1];
    const isDisabled = cell?.getAttribute("data-disabled-cell") === "true";
    if (!dataId || isDisabled) return;

    setIsSelecting(true);
    setInitialCoords({
      initialX: e.clientX,
      initialY: e.clientY,
    });

    if (newSelectedSlots?.includes(dataId)) {
      setIsRemoving(true);
    }
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = e => {
    e.preventDefault();

    const cell = document.elementFromPoint(e.clientX, e.clientY);
    const dataId = cell?.getAttribute("data-id")?.split("T")[1];
    const isDisabled = cell?.getAttribute("data-disabled-cell") === "true";

    // console.log("DY", e.clientY - initialCoords.initialY, "DX", e.clientX - initialCoords.initialX);

    // Не хотим чтобы ячейка красилась, если мы скроллим горизонтально на мобилах
    if (
      !dataId ||
      isDisabled ||
      !isEditing ||
      !isSelecting ||
      !initialCoords ||
      Math.abs(e.clientY - initialCoords.initialY) <= 3 ||
      Math.abs(e.clientY - initialCoords.initialY) < Math.abs(e.clientX - initialCoords.initialX)
    )
      return;

    if (isRemoving && newSelectedSlots?.includes(dataId)) {
      console.log(`delete ${dataId} in pointer move`);

      setSelectNewSell(columnId, dataId, true);
    } else if (!isRemoving && !newSelectedSlots?.includes(dataId)) {
      console.log(`added ${dataId} in pointer move`);

      setSelectNewSell(columnId, dataId);
    }
  };

  const handlePointerUp: React.PointerEventHandler<HTMLDivElement> = e => {
    e.preventDefault();

    const cell = document.elementFromPoint(e.clientX, e.clientY);
    const dataId = cell?.getAttribute("data-id")?.split("T")[1];
    const isDisabled = cell?.getAttribute("data-disabled-cell") === "true";

    if (!dataId || isDisabled || !isEditing || !isSelecting) return;

    setIsSelecting(false);
    setIsRemoving(false);

    if (isRemoving && newSelectedSlots?.includes(dataId)) {
      console.log(`delete ${dataId} in pointer move`);

      setSelectNewSell(columnId, dataId, true);
    } else if (!isRemoving && !newSelectedSlots?.includes(dataId)) {
      console.log(`added ${dataId} in pointer move`);

      setSelectNewSell(columnId, dataId);
    }
  };

  console.log("NEW SELECTED SLOTS", newSelectedSlots);
  console.log("Cell Ranges", cellIds);

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
                  isTimeZoneDisabled
                />
              ))}
              <TableCell
                isLastCell={cellIds?.length == 0 && isShowAfter.isShow == false}
                isFirstCell={disabledBeforeCells.length == 0}
                id={"disabled-cell"}
                isTimeZoneDisabled
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
                const isBeforeCurrentTime = new Date(cell).getTime() < Date.now();
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
                    isBeforeCurrentTime={isBeforeCurrentTime}
                  />
                );
              })}
              {indexRanges < cellIds.length - 1 && (
                <TableCell
                  columnRef={columnRef}
                  isLastCell={false}
                  isFirstCell={false}
                  id={"disabled-cell"}
                  isTimeZoneDisabled
                />
              )}
            </div>
          ))}

          {/* Фейковые слоты после активного диапазона */}
          {isShowAfter.isShow && (
            <>
              <TableCell
                columnRef={columnRef}
                isLastCell={false}
                isFirstCell={false}
                id={"disabled-cell"}
                isTimeZoneDisabled
              />
              {disabledAfterCells.map((cellId, cellIndex) => (
                <TableCell
                  columnRef={columnRef}
                  isFirstCell={false}
                  isLastCell={cellIndex == disabledAfterCells.length - 1}
                  id={cellId}
                  key={cellId}
                  isTimeZoneDisabled
                />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
});
