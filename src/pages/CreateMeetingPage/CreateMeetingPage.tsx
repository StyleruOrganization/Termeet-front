import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { CalendarWidget } from "@/shared/components/Calendar/Calendar";
import { isTouchDevice } from "@/shared/utils/isTouchDevice";
import { MeetingForm } from "@components/MeetingForm";
import { meetingSchema, type Meeting } from "@shared/types/CreateMeeting.types";
import styles from "./CreateMeetingPage.module.css";

export const CreateMeetingPage = () => {
  const methods = useForm<Meeting>({
    resolver: zodResolver(meetingSchema),
  });
  const [stepCreating, setStepCreating] = useState<"calendar" | "form">("calendar");
  const isTouch = useMemo(() => isTouchDevice(), []);

  const { handleSubmit, reset } = methods;
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
              <CalendarWidget />
              {isTouch && stepCreating === "calendar" && (
                <button
                  onClick={() => {
                    setStepCreating("form");
                  }}
                  className={styles.CreateMeetingPage__ContinueButton}
                  data-test-id='next-step-form'
                >
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
