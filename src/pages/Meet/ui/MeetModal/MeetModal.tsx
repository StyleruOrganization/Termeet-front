import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useMeetStore } from "@/entities/Meet";
import { useSessionStore } from "@/entities/User";
import { Input, ModalWrapper } from "@/shared/ui";
import BigIcon from "@assets/icons/bigShadow.svg";
import PrintIcon from "@assets/icons/print.svg";
import SmallIcon from "@assets/icons/smallShadow.svg";
import styles from "./MeetModal.module.css";
import { useSaveUserSelectedSlots } from "../../api";

const WINDOW_HEIGHT = window.innerHeight;

export const MeetModal = ({ mySlotName }: { mySlotName: string | null }) => {
  const { hash } = useParams();
  const user = useSessionStore(state => state.user);
  const defaultName = mySlotName || (user ? `${user.first_name} ${user.last_name}`.trim() : "");
  const [userName, setUserName] = useState(defaultName);
  const [error, setError] = useState("");
  const isOpen = useMeetStore(state => state.isModalOpen);
  const isEditing = useMeetStore(state => state.isEditing);
  const setIsModalOpen = useMeetStore(store => store.setIsModalOpen);
  const setIsEditingMode = useMeetStore(store => store.setIsEditing);
  const fillSelectedSlotsFromUser = useMeetStore(store => store.fillSelectedSlotsFromUser);
  const users = useMeetStore(store => store.users);
  const { mutate: saveSelectesSlots } = useSaveUserSelectedSlots(hash || "", () => {
    setIsEditingMode(false);
    setIsModalOpen(false);
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const isRename = Boolean(user && mySlotName);

  const nameTaken = useCallback((value: string) => users.includes(value) && value !== mySlotName, [users, mySlotName]);

  useEffect(() => {
    if (isOpen) {
      setUserName(defaultName);
      setError(defaultName && nameTaken(defaultName) ? "Пользователь с таким именем уже существует!" : "");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, defaultName, users, mySlotName, nameTaken]);

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
        flushTop
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
              const nextName = userName.trim();
              if (isRename && mySlotName && !isEditing) {
                fillSelectedSlotsFromUser(mySlotName);
              }
              saveSelectesSlots({
                name: nextName,
                isEdit: isRename,
                previousName: isRename && mySlotName ? mySlotName : undefined,
              });
              setUserName("");
            }}
            data-test-id='meet-modal'
            className={styles.MeetModal__Form}
          >
            <div className={styles.MeetModal__Heading}>
              {user
                ? "Как показать ваше имя на этой встрече?"
                : "Слоты заполнены! Осталось заполнить информацию о себе"}
            </div>
            <Input
              ref={inputRef}
              label='Как тебя зовут?'
              placeholder='Иван Иванов'
              name='userName'
              autoComplete='given-name'
              error={error}
              onChange={e => {
                setUserName(e.target.value);

                if (nameTaken(e.target.value)) {
                  setError("Пользователь с таким именем уже существует!");
                } else {
                  setError("");
                }
              }}
              value={userName}
            />
            <div className={styles.MeetModal__Buttons}>
              <button type='submit' disabled={isButtonDisabled} className={"baseButton mainButton"}>
                {isRename ? "Сохранить имя" : "Сохранить слоты"}
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
