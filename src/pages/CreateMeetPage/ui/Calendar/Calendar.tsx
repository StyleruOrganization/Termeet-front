import { forwardRef } from "react";
import { Calendar as ReactCalendar } from "react-calendar";
import { useFormContext, useFormState } from "react-hook-form";
import { Arrow, ErrorIcon } from "@assets/icons";
import styles from "./Calendar.module.css";
import { useCalendarData } from "../../lib";
import { formatMonthYearHeading, formatWeekday } from "../../lib/formatting/calendarFormatters";
import type { ICreateMeet } from "../../model";

import "./overWriteCalendar.css";

export const Calendar = forwardRef<HTMLDivElement, { minDate?: Date; value?: Date }>(
  ({ minDate = new Date(), value = new Date() }, ref) => {
    const { control } = useFormContext<ICreateMeet>();
    const { errors } = useFormState({
      control,
      name: ["date"],
    });

    const { onDateClick, formatClassName } = useCalendarData();

    return (
      <>
        <ReactCalendar
          inputRef={ref}
          data-test-id='calendar'
          locale='ru-RU'
          minDetail='month'
          nextAriaLabel='Go to next'
          prevAriaLabel='Go to prev'
          minDate={minDate}
          value={value}
          className={styles.Calendar}
          next2Label={null}
          prev2Label={null}
          nextLabel={<Arrow className={styles.Calendar__Arrow} />}
          prevLabel={<Arrow className={styles.Calendar__Arrow_Left} />}
          showNeighboringMonth={false}
          formatMonthYear={(_, date) => {
            return formatMonthYearHeading(date);
          }}
          navigationLabel={({ date }) => {
            const [month, year] = formatMonthYearHeading(date).split(" ");
            return (
              <div className='custom-month-year'>
                <span className='month'>{month}</span>
                <span className='year'>{" " + year}</span>
              </div>
            );
          }}
          formatShortWeekday={formatWeekday}
          onClickDay={onDateClick}
          tileClassName={formatClassName}
        />
        {errors.date?.message && (
          <div data-test-id='error-field' className={styles.Calendar__ErrorField}>
            <ErrorIcon />
            <span>{errors.date.message}</span>
          </div>
        )}
      </>
    );
  },
);
