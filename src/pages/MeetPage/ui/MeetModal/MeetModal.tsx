import { useActionState, useState } from "react";
import { useParams } from "react-router";
import { ModalWrapper, Input } from "@/shared/ui";
import { useMeetStore } from "@entities/Meet";
import { useSaveUserSelectedData } from "./../../api";
import styles from "./MeetModal.module.css";

type FormState = {
  isDisabled: boolean;
};

export const MeetModal = () => {
  const { hash } = useParams();
  const [userName, setUserName] = useState("");
  const isOpen = useMeetStore(state => state.isModalOpen);
  const setIsModalOpen = useMeetStore(state => state.setIsModalOpen);
  const setIsEditingMode = useMeetStore(store => store.setIsEditing);
  const { mutate } = useSaveUserSelectedData(hash || "", () => {
    setIsEditingMode(false);
    setIsModalOpen(false);
  });
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    (prevState, formData) => {
      console.log("call useActionState", prevState, formData);

      const userName = formData.get("userName")?.toString().trim() || "";
      if (!userName)
        return {
          isDisabled: true,
        };
      mutate(userName);

      return {
        isDisabled: false,
      };
    },
    {
      isDisabled: false,
    },
  );

  const isValidName = userName.trim().length > 0;
  console.log(isPending, !isValidName, state.isDisabled);
  const isButtonDisabled = isPending || !isValidName || state.isDisabled;

  return (
    <>
      <ModalWrapper isAnimate animationDuration={300} isOpen={isOpen} onClose={() => setIsModalOpen(false)}>
        <form action={formAction} data-test-id='meet-modal' className={styles.MeetModal}>
          <div className={styles.MeetModal__Heading}>Введите ваше имя</div>
          <Input
            placeholder='Иван Иванов'
            name='userName'
            autoComplete='given-name'
            onChange={e => {
              setUserName(e.target.value);
            }}
          />
          <div className={styles.MeetModal__Buttons}>
            <button
              onClick={() => {
                setIsModalOpen(false);
              }}
              disabled={isPending}
              className={"baseButton secondaryButton"}
            >
              Изменить слоты
            </button>
            <button disabled={isButtonDisabled} className={"baseButton mainButton"}>
              Сохранить слоты
            </button>
          </div>
        </form>
      </ModalWrapper>
    </>
  );
};
