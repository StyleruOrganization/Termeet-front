import { useScrollToTop } from "@/shared/libs";
import { useCreateMeet } from "./api/useCreateMeet";
import styles from "./CreateMeet.module.css";
import { useCreateMeetStore } from "./model/useCreateMeetStore";
import { Calendar } from "./ui/Calendar/Calendar";
import { Form } from "./ui/Form/Form";

const CreateButton = () => {
  const values = useCreateMeetStore(state => state.values);
  const errors = useCreateMeetStore(state => state.errors);
  const scrollToTop = useScrollToTop();

  return (
    <>
      {/* Обертка для мобил там где fixed */}
      <div className={styles.CreateMeetingPage__CreateButtonWrapper}>
        <button
          disabled={!values.title || values.dates.length == 0 || Object.values(errors).some(Boolean)}
          data-test-id='create-meet'
          className={`baseButton mainButton ${styles.CreateMeetingPage__CreateButton}`}
          type='submit'
          onClick={() => {
            scrollToTop();
          }}
        >
          Создать встречу
        </button>
      </div>
    </>
  );
};

export function CreateMeet() {
  const resetForm = useCreateMeetStore(state => state.resetForm);

  const { createMeet } = useCreateMeet({
    onSuccess: () => {
      resetForm();
    },
  });

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const values = useCreateMeetStore.getState().values;
    createMeet(values);
  };

  return (
    <div className={styles.CreateMeetingPage__Content}>
      <h1 className={styles.CreateMeetingPage__Content__Title}>Создайте встречу</h1>
      <form className={styles.CreateMeetingPage__Form} onSubmit={handleSubmit}>
        <div className={styles.CreateMeetingPage__Calendar}>
          <Calendar suggestMessage='Выберите минимум один день' />
        </div>
        <div className={styles.CreateMeetingPage__Content__FormWrapper}>
          <Form />
          <CreateButton />
        </div>
      </form>
    </div>
  );
}
