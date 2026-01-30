import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { CalendarWidget } from "@/shared/components/Calendar/Calendar";
import { MeetingForm } from "@components/MeetingForm";
import { meetingSchema, type Meeting } from "@shared/types/CreateMeeting.types";
import { useTouchSelectDate } from "./CreateMeetingPage.hooks/useTouchSelectDate";
import styles from "./CreateMeetingPage.module.css";

export const CreateMeetingPage = () => {
  const methods = useForm<Meeting>({
    resolver: zodResolver(meetingSchema),
  });
  const { handleSubmit, reset } = methods;
  const { stepCreating, isTouch, calendarRef, setStepForm } = useTouchSelectDate(methods);

  const onSubmit: SubmitHandler<Meeting> = data => {
    console.log(data);
    reset();
  };

  return (
    <div className={styles.CreateMeetingPage}>
      <div className={styles.CreateMeetingPage__Header}>termeet</div>
      <div className={styles.CreateMeetingPage__Content}>
        <h1 className={styles.CreateMeetingPage__Content__Title}>Создать встречу</h1>
        <FormProvider {...methods}>
          <form className={styles.CreateMeetingPage__Form} onSubmit={handleSubmit(onSubmit)}>
            <div className={styles.CreateMeetingPage__Calendar}>
              <CalendarWidget ref={calendarRef} />
              {isTouch && stepCreating === "calendar" && (
                <button onClick={setStepForm} className={styles.CreateMeetingPage__ContinueButton}>
                  Продолжить
                </button>
              )}
            </div>
            {((isTouch && stepCreating === "form") || !isTouch) && (
              <div className={styles.CreateMeetingPage__Content__FormWrapper}>
                <MeetingForm />
                <button data-test-id='create-meet' className={styles.CreateMeetingPage__CreateButton} type='submit'>
                  Создать встречу
                </button>
              </div>
            )}
          </form>
        </FormProvider>
      </div>
    </div>
  );
};
