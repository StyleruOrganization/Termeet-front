import Calendar from "react-calendar";
import { useFormContext, useFormState } from "react-hook-form";
import Arrow_24 from "@assets/icons/arrow_24.svg";
import ErrorIcon from "@assets/icons/error.svg";
import { useDateSelect } from "./Calendar.hooks/useDateSelect";
import styles from "./Calendar.module.css";
import { formatMonthYearHeading, formatWeekday } from "./Calendar.utils/Formatters";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

import "./OverWriteCalendar.css";

export const CalendarWidget = () => {
  const { control } = useFormContext<Meeting>();
  const { errors } = useFormState({
    control,
    name: ["date"],
  });
  const { onDateClick, selectedDates } = useDateSelect();

  return (
    <>
      <Calendar
        locale='ru-RU'
        minDetail='month'
        nextAriaLabel='Go to next'
        prevAriaLabel='Go to prev'
        minDate={new Date()}
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
          let className = "";
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
        <div className={styles.Calendar__ErrorField}>
          <ErrorIcon />
          <span>{errors.date.message}</span>
        </div>
      )}
    </>
  );
};
