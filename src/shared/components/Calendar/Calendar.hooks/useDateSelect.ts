import { useFormContext, useWatch } from "react-hook-form";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

type HandleDateClick = () => {
  onDateClick: (date: Date) => void;
  selectedDates: string[];
};

export const useDateSelect: HandleDateClick = () => {
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

  return {
    onDateClick,
    selectedDates,
  };
};
