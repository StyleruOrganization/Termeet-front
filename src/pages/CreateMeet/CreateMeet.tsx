import { useTranslation } from "@/shared/i18n";
import { useScrollToTop } from "@/shared/libs";
import { Container } from "@/shared/ui";
import { useCreateMeet } from "./api/useCreateMeet";
import styles from "./CreateMeet.module.css";
import { useCreateMeetStore } from "./model/useCreateMeetStore";
import { Calendar } from "./ui/Calendar/Calendar";
import { Form } from "./ui/Form/Form";
import { Onboarding } from "./ui/Onboarding/Onboarding";

const CreateButton = () => {
  const { t } = useTranslation();
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
          {t("create.submit")}
        </button>
      </div>
    </>
  );
};

export function CreateMeet() {
  const { t } = useTranslation();
  const resetForm = useCreateMeetStore(state => state.resetForm);

  // Имитация реального сбоя фронтенда для проверки мгновенного алертинга

  const { createMeet } = useCreateMeet({
    onSuccess: () => {
      resetForm();
    },
  });
  throw new Error("Uncaught TypeError: Cannot read properties of undefined (reading 'calendarDates') in CreateMeet");

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const store = useCreateMeetStore.getState();
    store.validateField("dates");
    store.validateField("title");
    store.validateField("voteDeadlineDate");
    store.validateField("link");
    store.validateField("description");

    const { values, errors } = useCreateMeetStore.getState();
    if (!values.title || values.dates.length === 0 || Object.values(errors).some(Boolean)) {
      return;
    }
    createMeet(values);
  };

  return (
    <Container>
      <div className={styles.CreateMeetingPage__Content}>
        <h1 className={styles.CreateMeetingPage__Content__Title}>{t("create.pageTitle")}</h1>
        <form className={styles.CreateMeetingPage__Form} onSubmit={handleSubmit}>
          <div className={styles.CreateMeetingPage__Calendar}>
            <Calendar suggestMessage={t("create.pickDays")} />
            <Onboarding />
          </div>
          <div className={styles.CreateMeetingPage__Content__FormWrapper}>
            <Form />
            <CreateButton />
          </div>
        </form>
      </div>
    </Container>
  );
}
