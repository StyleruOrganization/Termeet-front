// import { useToastStore } from "@/features/ToastContainer";
import { Loader } from "@/shared/ui";
// import styles from "./CreateMeetPage.module.css";
// import { useCreateMeetStore } from "./model/createMeetStore";
// import { CalendarWidget } from "./ui/Calendar";
// import { MeetingForm } from "./ui/MeetingForm";

// const CreateButton = () => {
//   const values = useCreateMeetStore(state => state.values);
//   const errors = useCreateMeetStore(state => state.errors);

//   console.log("formValues in CreateButton", values);
//   return (
//     <>
//       {/* Обертка для мобил там где fixed */}
//       <div className={styles.CreateMeetingPage__CreateButtonWrapper}>
//         <button
//           disabled={!values.title || values.dates.length == 0 || Object.values(errors).some(Boolean)}
//           data-test-id='create-meet'
//           className={styles.CreateMeetingPage__CreateButton}
//           type='submit'
//         >
//           Создать встречу
//         </button>
//       </div>
//     </>
//   );
// };

export function CreateMeetPage() {
  // const resetForm = useCreateMeetStore(state => state.resetForm);
  // const addToast = useToastStore(state => state.addToast);

  // const { createMeet } = useCreateMeet({
  //   onSuccess: () => {
  //     resetForm();
  //   },
  // });

  // const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
  //   event.preventDefault();

  //   const values = useCreateMeetStore.getState().values;

  //   console.log("Submit data:", values);
  //   addToast({
  //     type: "success",
  //     message: "Встреча успешно создана",
  //     id: "create-meet-success",
  //   });

  //   resetForm();
  // };

  return (
    <>
      <Loader />
    </>
    // <div className={styles.CreateMeetingPage__Content}>
    //   <h1 className={styles.CreateMeetingPage__Content__Title}>Создайте встречу</h1>
    //   <form className={styles.CreateMeetingPage__Form} onSubmit={handleSubmit}>
    //     <div className={styles.CreateMeetingPage__Calendar}>
    //       <CalendarWidget suggestMessage='Выберите минимум один день' />
    //     </div>
    //     <div className={styles.CreateMeetingPage__Content__FormWrapper}>
    //       <MeetingForm />
    //       <CreateButton />
    //     </div>
    //   </form>
    // </div>
  );
}
