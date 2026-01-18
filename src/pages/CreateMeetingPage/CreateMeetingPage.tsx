import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { MeetingForm } from "@components/MeetingForm";
import { meetingSchema, type Meeting } from "@shared/types/CreateMeeting.types";
import styles from "./CreateMeetingPage.module.css";

export const CreateMeetingPage = () => {
  const methods = useForm<Meeting>({
    resolver: zodResolver(meetingSchema),
  });
  const { handleSubmit, reset } = methods;

  const onSubmit: SubmitHandler<Meeting> = data => {
    console.log(data);
    reset();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <MeetingForm />
        <button style={{ width: "100%" }} className={styles.CreateMeetingPage__CreateButton}>
          Создать
        </button>
      </form>
    </FormProvider>
  );
};
