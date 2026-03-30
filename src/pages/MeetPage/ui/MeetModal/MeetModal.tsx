import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { ModalWrapper, Input } from "@/shared/ui";
import BigIcon from "@assets/icons/bigShadow.svg";
import PrintIcon from "@assets/icons/print.svg";
import SmallIcon from "@assets/icons/smallShadow.svg";
import { useMeetStore } from "@entities/Meet";
import styles from "./MeetModal.module.css";
import { useSaveUserSelectedSlots } from "../../api";

const WINDOW_HEIGHT = window.innerHeight;

export const MeetModal = () => {
  const { hash } = useParams();
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const isOpen = useMeetStore(state => state.isModalOpen);
  const setIsModalOpen = useMeetStore(state => state.setIsModalOpen);
  const setIsEditingMode = useMeetStore(store => store.setIsEditing);
  const users = useMeetStore(store => store.users);
  const { mutate: saveSelectesSlots } = useSaveUserSelectedSlots(hash || "", () => {
    setIsEditingMode(false);
    setIsModalOpen(false);
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setUserName("");
      setError("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const isValidName = userName.trim().length > 0;
  const isButtonDisabled = !isValidName || !!error;

  return (
    <>
      <ModalWrapper
        scrollbarWidth={window.innerWidth - document.documentElement.clientWidth}
        isAnimate
        animationDuration={300}
        isOpen={isOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <div className={styles.MeetModal__Wrapper}>
          {WINDOW_HEIGHT > 600 ? (
            <>
              <div className={styles.MeetModal__Header}>
                <div className={styles.MeetModal__HeaderBg}>
                  <SmallIcon className={styles.MeetModal__HeaderBg__SmallIcon} />
                  <BigIcon className={styles.MeetModal__HeaderBg__BigIcon} />
                </div>
              </div>
              <PrintIcon className={styles.MeetModal__PrintIcon} />
            </>
          ) : null}

          <form
            onSubmit={event => {
              event.preventDefault();
              const formValues = new FormData(event.target);
              const username = formValues.get("userName")?.toString() || "";
              console.log("NAME FOR SAVING", username);
              saveSelectesSlots(username);
              setUserName("");
            }}
            data-test-id='meet-modal'
            className={styles.MeetModal__Form}
          >
            <div className={styles.MeetModal__Heading}>Слоты заполнены! Осталось заполнить информацию о&nbsp;себе</div>
            <Input
              ref={inputRef}
              label='Как тебя зовут?'
              placeholder='Иван Иванов'
              name='userName'
              autoComplete='given-name'
              error={error}
              onChange={e => {
                setUserName(e.target.value);

                if (users.includes(e.target.value)) {
                  setError("Пользователь с таким именем уже существует!");
                } else {
                  setError("");
                }
              }}
              value={userName}
            />
            <div className={styles.MeetModal__Buttons}>
              <button type='submit' disabled={isButtonDisabled} className={"baseButton mainButton"}>
                Сохранить слоты
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className={"baseButton secondaryButton"}
                type='button'
              >
                Отменить
              </button>
            </div>
          </form>
        </div>
      </ModalWrapper>
    </>
  );
};
