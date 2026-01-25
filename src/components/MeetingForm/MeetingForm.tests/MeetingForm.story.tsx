import { FormProvider, useForm } from "react-hook-form";
import { MeetingForm } from "../MeetingForm";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

// Обертка для компонента с react-hook-form
export const MeetingFormWithForm = () => {
  const methods = useForm<Meeting>();

  return (
    <div style={{ padding: "10px" }}>
      <FormProvider {...methods}>
        <MeetingForm />
      </FormProvider>
    </div>
  );
};
