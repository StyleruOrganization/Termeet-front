import { useEffect, useMemo } from "react";
import { generateTimeOptions } from "@/shared/libs";
import { Arrow } from "@assets/icons";
import { useMeetContext } from "@entities/Meet";
import styles from "./MeetTable.module.css";
import { useColumnWidth, useArrows } from "../../lib";
import { TableColumn } from "../TableColumn/TableColumn";
import type { MeetTableProps } from "./MeetTable.types";

export const MeetTable = ({ timeRanges, meeting_days }: MeetTableProps) => {
  const { columnContainerRef, measureContainerRef, columnWidth, calculateColumnWidth, daysVisible } =
    useColumnWidth(meeting_days);
  const { onScrollLeft, onScrollRight, updateArrows, arrowsState } = useArrows(columnContainerRef, columnWidth);
  const setHoveredUsers = useMeetContext(store => store.setHoveredUsers);
  const setHoveredUser = useMeetContext(store => store.setHoveredUser);

  const timeOptions = useMemo(() => {
    return timeRanges.map(([startTime, endTime]) => {
      const times = generateTimeOptions(startTime, endTime, 60);

      return times.map(([hours, minutes]) => {
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      });
    });
  }, [timeRanges]);

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
      <div className={styles.MeetTable__TimesContainer}>
        {timeOptions.map((timePeriodOpitions, indexPeriods) => (
          <div key={indexPeriods}>
            <div
              className={
                styles.MeetTable__TimesPeriod +
                (indexPeriods < timeOptions.length - 1 ? " " + styles.MeetTable__TimesPeriod_beforeSepate : "")
              }
              key={`period-${indexPeriods}`}
              style={
                {
                  "--size-factor": `${timePeriodOpitions.at(-1)}:00` !== timeRanges[indexPeriods].at(-1) ? "1" : "0",
                } as React.CSSProperties
              }
            >
              {timePeriodOpitions.map(timeOption => (
                <span key={timeOption}>{timeOption}</span>
              ))}
            </div>
            {indexPeriods < timeOptions.length - 1 &&
              Number(timeOptions[indexPeriods][timePeriodOpitions.length - 1].split(":")[0]) -
                Number(timeRanges[indexPeriods + 1][0].split(":")[0]) !=
                -1 && <div className={styles.MeetTable__TimesPeriodSeparator}>...</div>}
          </div>
        ))}
      </div>
      <div ref={measureContainerRef} className={styles.MeetTable__ColumnsWrapper}>
        <div
          ref={columnContainerRef}
          className={styles.MeetTable__Columns}
          style={daysVisible > 0 ? { maxWidth: `${daysVisible * columnWidth}px` } : undefined}
        >
          {meeting_days.map((columnId, index) => (
            <div
              key={index}
              style={{ width: `${columnWidth}px` }}
              data-column-id={columnId}
              className={styles.MeetTable__ColumnWrapper}
            >
              <TableColumn timeRanges={timeRanges} columnWidth={columnWidth} key={index} columnId={columnId} />
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
