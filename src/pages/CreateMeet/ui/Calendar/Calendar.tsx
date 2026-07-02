import { useState } from "react";
import { Calendar as ReactCalendar } from "react-calendar";
import Arrrow from "@assets/icons/arrow.svg";
import { isTouchDevice } from "@shared/libs";
import styles from "./Calendar.module.css";
import { useCalendarData, formatMonthYearHeading, formatWeekday } from "../../lib";
import "./overWriteCalendar.css";

export const Calendar = ({
  minDate = new Date(),
  value = new Date(),
  suggestMessage,
}: {
  minDate?: Date;
  value?: Date;
  suggestMessage?: string;
}) => {
  const [selectedDateForInterval, setSelectedDateForInterval] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const {
    onDateClick,
    formatClassName,
    error,
    selectedDates,
    formatClassNameForDateWrapperWhenHover,
    formatClassNameInterval,
  } = useCalendarData();
  const isTouch = isTouchDevice();
  const handlePointerMove = (date: Date) => {
    if (selectedDateForInterval && hoveredDate?.toDateString() !== date.toDateString()) {
      console.log("IN POINTER MOVE");

      setHoveredDate(date);
    }
  };
  const handlePointerLeave = () => {
    setHoveredDate(null);
  };

  return (
    <div className={styles.CalendarWrapper}>
      <ReactCalendar
        className={styles.Calendar}
        data-test-id='calendar'
        locale='ru-RU'
        minDetail='month'
        nextAriaLabel='Go to next'
        prevAriaLabel='Go to prev'
        minDate={minDate}
        value={value}
        next2Label={null}
        prev2Label={null}
        nextLabel={<Arrrow className={styles.Calendar__Arrow} />}
        prevLabel={<Arrrow className={styles.Calendar__Arrow_Left} />}
        formatMonthYear={(_, date) => {
          return formatMonthYearHeading(date);
        }}
        formatShortWeekday={formatWeekday}
        onClickDay={date => {
          if (
            isTouch &&
            !selectedDates.find(({ start, end }) => {
              return start <= date && date <= end;
            })
          ) {
            onDateClick({
              startDate: date,
              endDate: date,
            });
            return;
          }
          const dateInExistInterval = selectedDates.find(({ start, end }) => {
            return start <= date && date <= end;
          });

          // Клик по концу/началу интервала - даем возможность выбрать новый интервал
          if (
            dateInExistInterval &&
            (dateInExistInterval.start.toDateString() == date.toDateString() ||
              dateInExistInterval.end.toDateString() == date.toDateString())
          ) {
            console.log("Клик по концу/началу интервала");
            if (dateInExistInterval.start.toDateString() == date.toDateString()) {
              console.log("Клик по началу интервала");
              onDateClick({
                startDate: date,
                endDate: null,
                overrideCurrentData: true,
              });
            } else {
              console.log("Клик по концу интервала");
              onDateClick({
                startDate: null,
                endDate: date,
                overrideCurrentData: true,
              });
            }
            setSelectedDateForInterval(date);
          }
          // Клик по дню внутри уже отмеченного интервала - выбираем как лучше его сократить
          // но только если это клик первый а не завершение выбора интервала
          else if (dateInExistInterval && !selectedDateForInterval) {
            const diffTimeBetweenStartAndSelected = Math.abs(date.getTime() - dateInExistInterval.start.getTime());
            const diffTimeBetweenEndAndSelected = Math.abs(dateInExistInterval.end.getTime() - date.getTime());

            if (diffTimeBetweenStartAndSelected < diffTimeBetweenEndAndSelected) {
              console.log("Ближе к началу интервала, удаляем начало");
              onDateClick({
                startDate: date,
                endDate: dateInExistInterval.end,
                overrideCurrentData: true,
              });
            } else {
              console.log("Ближе к концу интервала, удаляем конец");
              onDateClick({
                startDate: dateInExistInterval.start,
                endDate: date,
                overrideCurrentData: true,
              });
            }
          }
          // Клик после выбора начала интервала
          else if (selectedDateForInterval && hoveredDate) {
            const startDate = selectedDateForInterval > hoveredDate ? hoveredDate : selectedDateForInterval;
            const endDate = selectedDateForInterval < hoveredDate ? hoveredDate : selectedDateForInterval;
            console.log("Выбрали конец интервала");
            onDateClick({
              startDate,
              endDate,
            });
            setSelectedDateForInterval(null);
            setHoveredDate(null);
          } else {
            setSelectedDateForInterval(date);
          }
        }}
        tileClassName={({ date }) => {
          return (
            formatClassNameForDateWrapperWhenHover(selectedDateForInterval, hoveredDate, date) +
            " " +
            formatClassNameInterval(date) +
            " " +
            styles.Calendar__Day_Wrapper
          );
        }}
        tileContent={({ date }) => (
          <button
            onPointerMove={() => handlePointerMove(date)}
            onPointerLeave={handlePointerLeave}
            type='button'
            className={formatClassName(date, [selectedDateForInterval, hoveredDate])}
          >
            {date.getDate()}
          </button>
        )}
      />
      {suggestMessage && !selectedDates.length && !error && (
        <div className={styles.Calendar__SuggestField}>
          <span>{suggestMessage}</span>
        </div>
      )}
      {error && (
        <div className={styles.Calendar__ErrorField}>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
