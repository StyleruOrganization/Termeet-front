import { forwardRef } from "react";
import Calendar from "react-calendar";
import { useFormContext, useFormState } from "react-hook-form";
import { Arrow_24, ErrorIcon } from "@assets/icons";
import { useDateSelect } from "./Calendar.hooks/useDateSelect";
import styles from "./Calendar.module.css";
import { formatMonthYearHeading, formatWeekday } from "./Calendar.utils/Formatters";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

import "./overWriteCalendar.css";

export const CalendarWidget = forwardRef<HTMLDivElement, { minDate?: Date; value?: Date }>(
  ({ minDate = new Date(), value = new Date() }, ref) => {
    const { control } = useFormContext<Meeting>();
    const { errors } = useFormState({
      control,
      name: ["date"],
    });

    const { onDateClick, selectedDates } = useDateSelect();

    return (
      <>
        <Calendar
          value={value}
          inputRef={ref}
          data-test-id='calendar'
          locale='ru-RU'
          minDetail='month'
          nextAriaLabel='Go to next'
          prevAriaLabel='Go to prev'
          minDate={minDate}
          className={styles.Calendar}
          next2Label={null}
          prev2Label={null}
          nextLabel={<Arrow_24 className={styles.Calendar__Arrow} />}
          prevLabel={<Arrow_24 className={styles.Calendar__Arrow_Left} />}
          showNeighboringMonth={false}
          // @ts-expect-error Хз, тоже типы не сходятся, но все воркает, как застилизовать слово внутри span незнаю как
          formatMonthYear={(_, date) => {
            const [month, year] = formatMonthYearHeading(date).split(" ");

            return (
              <div className='custom-month-year'>
                <span className='month'>{month}</span>
                <span className='year'>{" " + year}</span>
              </div>
            );
          }}
          formatShortWeekday={(_, date) => {
            return formatWeekday(date);
          }}
          onClickDay={onDateClick}
          tileClassName={({ date, view }) => {
            let className = "calendar-day ";
            if (view === "month") {
              className += styles.Calendar__Day;
              if (date.getDay() == 6 || date.getDay() == 0) {
                className += " " + styles.Calendar__Day_Weekend;
              }
              const dateValue = date.toISOString().split("T")[0];
              if (selectedDates.includes(dateValue)) {
                className += " " + styles.Calendar__Day_Selected;
              }
            }
            return className;
          }}
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
