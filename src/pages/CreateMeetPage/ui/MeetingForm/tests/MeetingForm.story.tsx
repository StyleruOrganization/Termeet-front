import { FormProvider, useForm } from "react-hook-form";
import { MeetingForm } from "./../MeetingForm";
import type { ICreateMeet } from "../../../model";

// Обертка для компонента с react-hook-form
export const MeetingFormWithForm = () => {
  const methods = useForm<ICreateMeet>();

  return (
    <div style={{ padding: "10px" }}>
      <FormProvider {...methods}>
        <MeetingForm />
      </FormProvider>
    </div>
  );
};
