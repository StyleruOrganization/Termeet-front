import { Calendar as ReactCalendar } from "react-calendar";
import { Arrow } from "@assets/icons";
import styles from "./Calendar.module.css";
import { useCalendarData } from "../../lib";
import { formatMonthYearHeading, formatWeekday } from "../../lib/formatting/calendarFormatters";

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
  const { onDateClick, formatClassName, error, selectedDates } = useCalendarData();

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
        nextLabel={<Arrow className={styles.Calendar__Arrow} />}
        prevLabel={<Arrow className={styles.Calendar__Arrow_Left} />}
        formatMonthYear={(_, date) => {
          return formatMonthYearHeading(date);
        }}
        formatShortWeekday={formatWeekday}
        onClickDay={onDateClick}
        tileClassName={formatClassName}
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
