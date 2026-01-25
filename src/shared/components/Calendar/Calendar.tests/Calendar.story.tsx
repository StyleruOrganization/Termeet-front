import { FormProvider, useForm } from "react-hook-form";
import { CalendarWidget } from "../Calendar";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

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
        <CalendarWidget />
      </FormProvider>
    </div>
  );
};
