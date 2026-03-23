import { Calendar as ReactCalendar } from "react-calendar";
import { useFormContext, useFormState } from "react-hook-form";
import { Arrow } from "@assets/icons";
import styles from "./Calendar.module.css";
import { useCalendarData } from "../../lib";
import { formatMonthYearHeading, formatWeekday } from "../../lib/formatting/calendarFormatters";
import type { ICreateMeet } from "../../model";

import "./overWriteCalendar.css";

export const Calendar = ({ minDate = new Date(), value = new Date() }: { minDate?: Date; value?: Date }) => {
  const { control } = useFormContext<ICreateMeet>();
  const { errors } = useFormState({
    control,
    name: ["dates"],
  });

  const { onDateClick, formatClassName } = useCalendarData();

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
      {errors.dates?.message && (
        <div data-test-id='error-field' className={styles.Calendar__ErrorField}>
          <span>{errors.dates.message}</span>
        </div>
      )}
    </div>
  );
};
