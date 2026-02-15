import { useEffect, useMemo } from "react";
import { generateTimeOptions } from "@/shared/libs/dates/generateTimeOptions";
import { Arrow } from "@assets/icons";
import { useMeetContext } from "@entities/Meet";
import styles from "./MeetTable.module.css";
import { getCellIds } from "../../helpers/getCellsIds";
import { useArrows } from "../../lib/useArrows";
import { useColumnWidth } from "../../lib/useColumnWidth";
import { TableColumn } from "../TableColumn/TableColumn";
import type { MeetTableProps } from "./MeetTable.types";

export const MeetTable = ({ start_time, end_time, meeting_days }: MeetTableProps) => {
  const { columnContainerRef, measureContainerRef, columnWidth, calculateColumnWidth, daysVisible } =
    useColumnWidth(meeting_days);
  const { onScrollLeft, onScrollRight, updateArrows, arrowsState } = useArrows(columnContainerRef, columnWidth);
  const setHoveredUsers = useMeetContext(store => store.setHoveredUsers);
  const setHoveredUser = useMeetContext(store => store.setHoveredUser);

  const cellIds = useMemo(
    () => getCellIds({ start_time, end_time, meeting_days }),
    [start_time, end_time, meeting_days],
  );

  const timeOptions = useMemo(() => {
    const times = generateTimeOptions(start_time, end_time, 60);
    return times.map(([hours, minutes]) => {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    });
  }, [start_time, end_time]);

  useEffect(() => {
    const columnContainer = columnContainerRef.current;
    if (!columnContainer) return;

    const handleScroll = () => updateArrows();
    columnContainer.addEventListener("scroll", handleScroll);

    updateArrows();

    return () => columnContainer.removeEventListener("scroll", handleScroll);
  }, [columnContainerRef, updateArrows]);

  useEffect(() => {
    updateArrows();
  }, [columnWidth, updateArrows]);

  useEffect(() => {
    updateArrows();
    requestAnimationFrame(() => {
      calculateColumnWidth();
    });
  }, [calculateColumnWidth, updateArrows]);

  useEffect(() => {
    const cancelHoveredUsers = () => {
      setHoveredUsers([]);
      setHoveredUser("");
    };
    window.addEventListener("click", cancelHoveredUsers);
    return () => window.removeEventListener("click", cancelHoveredUsers);
  }, [setHoveredUsers, setHoveredUser]);

  return (
    <div className={styles.MeetTable}>
      <div className={styles.MeetTable__Times}>
        {timeOptions.map(timeOption => (
          <span key={timeOption}>{timeOption}</span>
        ))}
      </div>
      <div ref={measureContainerRef} className={styles.MeetTable__ColumnsWrapper}>
        <div
          ref={columnContainerRef}
          className={styles.MeetTable__Columns}
          style={daysVisible > 0 ? { maxWidth: `${daysVisible * columnWidth}px` } : undefined}
        >
          {Object.keys(cellIds).map((column, index) => (
            <div
              key={index}
              style={{ width: `${columnWidth}px` }}
              data-column-id={column}
              className={styles.MeetTable__ColumnWrapper}
            >
              <TableColumn columnWidth={columnWidth} key={index} columnId={column} cellIds={cellIds[column]} />
            </div>
          ))}
        </div>
      </div>
      {arrowsState.leftActive || arrowsState.rightActive ? (
        <div className={styles.MeetTable__Arrows}>
          <button
            disabled={!arrowsState.leftActive}
            onClick={onScrollLeft}
            className={styles.MeetTable__Arrow + (arrowsState.leftActive ? " " + styles.MeetTable__Arrow_active : "")}
          >
            <Arrow />
          </button>
          <button
            disabled={!arrowsState.rightActive}
            onClick={onScrollRight}
            className={styles.MeetTable__Arrow + (arrowsState.rightActive ? " " + styles.MeetTable__Arrow_active : "")}
          >
            <Arrow />
          </button>
        </div>
      ) : null}
    </div>
  );
};
