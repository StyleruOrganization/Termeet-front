import { useActionState } from "react";
import { useParams } from "react-router";
import { ModalWrapper, Input } from "@/shared/ui";
import { useMeetContext } from "@entities/Meet";
import { useSaveUserSelectedData } from "./../../api";
import styles from "./MeetModal.module.css";

type FormState = {
  error: string | null;
  userName: string;
};

export const MeetModal = () => {
  const { hash } = useParams();
  const isOpen = useMeetContext(state => state.isModalOpen);
  const setIsOpen = useMeetContext(state => state.setIsModalOpen);
  const setIsEditingMode = useMeetContext(store => store.setIsEditing);
  const { mutate } = useSaveUserSelectedData(hash || "", () => {
    setIsEditingMode(false);
    setIsOpen(false);
  });
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    (prevState, formData) => {
      console.log("call useActionState", prevState, formData);

      const userName = formData.get("userName")?.toString().trim();

      console.log("userName", userName);

      if (!userName || userName === "") {
        return {
          error: "Необходимо ввести ваше имя",
          userName: prevState.userName || "",
        };
      }

      mutate(userName);

      return {
        error: null,
        userName,
      };
    },
    {
      error: null,
      userName: "",
    },
  );

  return (
    <>
      <ModalWrapper isAnimate animationDuration={300} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <form action={formAction} data-test-id='meet-modal' className={styles.MeetModal}>
          <h3 className={styles.MeetModal__Title}>Введите ваше имя</h3>
          <Input
            error={(!state.userName && state.error) || ""}
            placeholder='Иван Иванов'
            label='Введите ваше имя'
            name='userName'
            autoComplete='given-name'
          />
          <button disabled={isPending} className={styles.MeetModal__SaveButton}>
            Сохранить
          </button>
        </form>
      </ModalWrapper>
    </>
  );
};
