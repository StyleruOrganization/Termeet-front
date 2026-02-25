import { useEffect, useMemo, useRef, useState, memo } from "react";
import { MONTHS_GENITIVE, isMoreThan30Min } from "@/shared/libs";
import styles from "./TableColumn.module.css";
import { getCellIds, useColumnData } from "../../lib";
import { TableCell } from "../TableCell/TableCell";
import type { TableColumnProps } from "./TableColumn.types";

export const TableColumn = memo(({ columnId, columnWidth, timeRanges }: TableColumnProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);
  const {
    cellIds,
    userSlots,
    newSelectedSlots,
    isEditing,
    setSelectNewSell,
    maxSelectCount,
    hoveredUser,
    isShowAfter,
    isShowBefore,
  } = useColumnData(columnId);

  const date = useMemo(() => {
    const partsOfDate = columnId.split("-").map(Number);
    const month = partsOfDate[1],
      day = partsOfDate[2];
    return day + " " + MONTHS_GENITIVE.at(month - 1);
  }, [columnId]);

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

    const element = document.elementFromPoint(e.clientX, e.clientY);
    const dataId = element?.getAttribute("data-id")?.split("T")[1];
    if (!element || !dataId) return;

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

  console.log(cellIds, columnId);
  return (
    <>
      <span className={styles.TableColumnTitle}>{date}</span>
      <div style={{ width: `${columnWidth}px`, justifyContent }} className={styles.TableColumn} ref={columnRef}>
        <div className={styles.TableColumnRange}>
          {/* Фейковые слоты перед основным диапазона */}
          {isShowBefore.isShow && (
            <>
              {getCellIds({
                startTime: timeRanges[0][0],
                endTime: timeRanges[0][1],
                date: columnId,
              }).map(cellId => (
                <TableCell id={cellId} key={cellId} isDisabled />
              ))}
              {isShowBefore.isShowSeparator && <div className={styles.TableColumnSeparator}>...</div>}
            </>
          )}

          {cellIds?.map((cellsRange, indexRanges) => (
            <div
              key={indexRanges}
              className={styles.TableColumnActiveRange}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{
                marginBottom:
                  indexRanges < cellIds.length - 1 &&
                  isMoreThan30Min(cellIds[indexRanges][cellIds[indexRanges].length - 1], cellIds[indexRanges + 1]?.[0])
                    ? ""
                    : "-1px",
              }}
            >
              {cellsRange.map(cell => {
                const key = cell.split("T")[1];
                const selectedPersons = userSlots?.get(key) || [];
                return (
                  <TableCell
                    id={cell}
                    key={key}
                    isShowBefore={isShowBefore.isShow}
                    isShowAfter={isShowAfter.isShow}
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
              {indexRanges < cellIds.length - 1 &&
                isMoreThan30Min(
                  cellIds[indexRanges][cellIds[indexRanges].length - 1],
                  cellIds[indexRanges + 1]?.[0],
                ) && <div className={styles.TableColumnSeparator}>...</div>}
            </div>
          ))}

          {/* Фейковые слоты после активного диапазона */}
          {isShowAfter.isShow && (
            <>
              {isShowAfter.isShowSeparator && <div className={styles.TableColumnSeparator}>...</div>}
              {getCellIds({
                startTime: timeRanges[1]?.[0],
                endTime: timeRanges[1]?.[1],
                date: columnId,
              }).map(cellId => (
                <TableCell id={cellId} key={cellId} isDisabled />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
});
