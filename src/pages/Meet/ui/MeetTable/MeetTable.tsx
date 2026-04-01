import { useEffect, useMemo } from "react";
import { generateTimeOptions, isMoreOrEqThan30Min } from "@/shared/libs";
import { useMeetStore } from "@entities/Meet";
import styles from "./MeetTable.module.css";
import { useColumnWidth } from "../../lib";
import { TableColumn } from "../TableColumn/TableColumn";
import type { MeetTableProps } from "./MeetTable.types";

export const MeetTable = ({ timeRanges, meeting_days }: MeetTableProps) => {
  const { measureContainerRef, columnWidth, calculateColumnWidth } = useColumnWidth(meeting_days);
  const setHoveredUsers = useMeetStore(store => store.setHoveredUsers);
  const setHoveredUser = useMeetStore(store => store.setHoveredUser);

  const timeOptions = useMemo(() => {
    return timeRanges.map(([startTime, endTime]) => {
      const times = generateTimeOptions(startTime, endTime, 60);

      return times.map(([hours, minutes]) => {
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      });
    });
  }, [timeRanges]);

  useEffect(() => {
    requestAnimationFrame(() => {
      calculateColumnWidth();
    });
  }, [calculateColumnWidth]);

  useEffect(() => {
    const cancelHoveredUsers = () => {
      setHoveredUsers([], false);
      setHoveredUser("");
    };
    window.addEventListener("click", cancelHoveredUsers);
    return () => window.removeEventListener("click", cancelHoveredUsers);
  }, [setHoveredUsers, setHoveredUser]);

  return (
    <div className={styles.MeetTable}>
      <div className={styles.MeetTable__TimesPeriodsContainer}>
        {timeOptions.map((timePeriodOpitions, indexPeriods) => (
          <div key={indexPeriods}>
            <div
              style={{
                marginBottom: `${isMoreOrEqThan30Min(timePeriodOpitions[timePeriodOpitions.length - 1], timeRanges[indexPeriods][1]) ? 20 : 0}px`,
              }}
              className={styles.MeetTable__TimesPeriod}
              key={`period-${indexPeriods}`}
            >
              {timePeriodOpitions.map(timeOption => (
                <span key={timeOption}>{timeOption}</span>
              ))}
            </div>
            {indexPeriods < timeOptions.length - 1 && <div className={styles.MeetTable__TimesPeriodSeparator}>...</div>}
          </div>
        ))}
      </div>
      {/* Две обертки так как по одной расчитываем ширину колонки а другая является скролл контейнером */}
      <div className={styles.MeetTable__ColumnsWrapper}>
        <div ref={measureContainerRef} className={styles.MeetTable__Columns}>
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
    </div>
  );
};
