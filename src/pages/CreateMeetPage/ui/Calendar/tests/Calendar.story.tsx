import { FormProvider, useForm } from "react-hook-form";
import { CalendarWidget } from "../index";
import type { Meeting } from "@shared/types/CreateMeeting";

// Обертка для компонента с react-hook-form
export const CalendarWithForm = ({ error }: { error?: string }) => {
  const methods = useForm<Meeting>({
    defaultValues: {
      date: [],
    },
  });

  // Если передана ошибка, устанавливаем её вручную
  if (error) {
    methods.setError("date", {
      type: "manual",
      message: error,
    });
  }

  return (
    <div style={{ padding: "10px", maxWidth: "650px" }}>
      <FormProvider {...methods}>
        <CalendarWidget minDate={new Date(2026, 0)} value={new Date(2026, 0, 1)} />
      </FormProvider>
    </div>
  );
};
