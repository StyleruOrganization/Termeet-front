import { useFormContext, useWatch } from "react-hook-form";
import styles from "../ui/Calendar.module.css";
import type { Meeting } from "@shared/types/CreateMeeting.types";
import type { TileClassNameFunc } from "react-calendar";

export const useCalendarData = () => {
  const { control, setValue, trigger } = useFormContext<Meeting>();
  const selectedDates = useWatch({
    control,
    name: "date",
    defaultValue: [],
  });

  const onDateClick = (date: Date) => {
    if (date === null) {
      return;
    }

    const formattedDate = date.toISOString().split("T")[0];
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
      const dateValue = date.toISOString().split("T")[0];
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
