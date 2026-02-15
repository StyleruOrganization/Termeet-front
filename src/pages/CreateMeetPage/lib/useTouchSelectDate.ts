import { useMemo, useRef, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { isTouchDevice } from "@/shared/libs";
import type { ICreateMeet } from "../model";

export const useTouchSelectDate = (methods: UseFormReturn<ICreateMeet>) => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const { clearErrors, trigger } = methods;
  const [stepCreating, setStepCreating] = useState<"calendar" | "form">("calendar");

  const isTouch = useMemo(() => isTouchDevice(), []);

  const setStepForm = async () => {
    const isValid = await trigger("date");

    if (!isValid) return;
    if (calendarRef.current) {
      const calendarComponent = calendarRef.current;
      setTimeout(() => {
        const offset = calendarComponent.getBoundingClientRect().bottom;
        window.scrollTo({
          top: offset + window.pageYOffset,
          behavior: "smooth",
        });
      }, 0);
    }

    clearErrors();
    setStepCreating("form");
  };

  return {
    isTouch,
    setStepForm,
    stepCreating,
    calendarRef,
  };
};
