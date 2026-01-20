import Calendar from "react-calendar";
import { useFormContext, useFormState, useWatch } from "react-hook-form";
import Arrow_24 from "@assets/icons/arrow_24.svg";
import ErrorIcon from "@assets/icons/error.svg";
import styles from "./Calendar.module.css";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

import "./overWriteCalendar.css";

const shortDayNames = ["п", "в", "с", "ч", "п", "с", "в"];

export const CalendarWidget = () => {
  const { register, setValue, control, trigger } = useFormContext<Meeting>();
  register("date");
  const { errors } = useFormState({
    control,
    name: ["date"],
  });

  const formatter = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
    weekday: "short",
  });

  const selectedDates = useWatch({
    control,
    name: "date",
    defaultValue: [],
  });

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
          const formattedDate = formatter.format(date).split(" ");

          return (
            <div className='custom-month-year'>
              <span className='month'>
                {formattedDate[0][0].toUpperCase()}
                {formattedDate[0].slice(1)}
              </span>
              <span className='year'>{" " + formattedDate[1]}</span>
            </div>
          );
        }}
        formatShortWeekday={(_, date) => {
          return shortDayNames[date.getDay() - 1 < 0 ? 6 : date.getDay() - 1];
        }}
        onClickDay={dateIso => {
          if (dateIso === null) {
            return;
          }

          const date = dateIso.toISOString().split("T")[0];
          if (selectedDates.includes(date)) {
            setValue(
              "date",
              selectedDates.filter(d => d !== date),
            );
          } else {
            setValue("date", [...selectedDates, date]);
          }

          trigger("date");
        }}
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
