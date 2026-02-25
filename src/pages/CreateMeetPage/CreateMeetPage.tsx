import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler, FormProvider } from "react-hook-form";
import { useCreateMeet } from "./api";
import styles from "./CreateMeetPage.module.css";
import { useTouchSelectDate } from "./lib";
import { createMeetSchema } from "./model";
import { CalendarWidget } from "./ui/Calendar";
import { MeetingForm } from "./ui/MeetingForm";
import type { ICreateMeet } from "./CreateMeetPage.types";

export function CreateMeetPage() {
  const methods = useForm<ICreateMeet>({
    resolver: zodResolver(createMeetSchema),
  });
  const { handleSubmit, reset } = methods;
  const { stepCreating, isTouch, calendarRef, setStepForm } = useTouchSelectDate(methods);
  const { createMeet, isPending } = useCreateMeet({
    onSuccess: () => {
      reset();
    },
  });

  const onSubmit: SubmitHandler<ICreateMeet> = async data => {
    createMeet(data);
  };

  if (isPending) {
    return (
      <div className={styles.CreateMeetingPage__Content}>
        <h1 className={styles.CreateMeetingPage__Content__Title}>Создание встречи...</h1>
      </div>
    );
  }

  return (
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
  );
}
