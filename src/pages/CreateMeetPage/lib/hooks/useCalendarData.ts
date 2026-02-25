import { useFormContext, useWatch } from "react-hook-form";
import styles from "../../ui/Calendar/Calendar.module.css";
import type { ICreateMeet } from "../../model";
import type { TileClassNameFunc } from "react-calendar";

const formatDate = (date: Date) => {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
};

export const useCalendarData = () => {
  const { control, setValue, trigger } = useFormContext<ICreateMeet>();
  const selectedDates = useWatch({
    control,
    name: "date",
    defaultValue: [],
  });

  const onDateClick = (date: Date) => {
    if (date === null) {
      return;
    }

    const formattedDate = formatDate(date);
    if (selectedDates.includes(formattedDate)) {
      setValue(
        "date",
        selectedDates.filter(d => d !== formattedDate),
      );
    } else {
      setValue("date", [...selectedDates, formattedDate]);
    }

    trigger("date");
  };

  const formatClassName: TileClassNameFunc = ({ date, view }) => {
    let className = "calendar-day ";
    if (view === "month") {
      className += styles.Calendar__Day;
      if (date.getDay() == 6 || date.getDay() == 0) {
        className += " " + styles.Calendar__Day_Weekend;
      }
      const dateValue = formatDate(date);
      if (selectedDates.includes(dateValue)) {
        className += " " + styles.Calendar__Day_Selected;
      }
    }
    return className;
  };

  return {
    onDateClick,
    selectedDates,
    formatClassName,
  };
};
