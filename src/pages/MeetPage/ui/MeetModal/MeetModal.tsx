import { useRef, useState } from "react";
import { useParams } from "react-router";
import { ModalWrapper, Input } from "@/shared/ui";
import { useMeetContext } from "@entities/Meet";
import { useSaveUserSelectedData } from "./../../api";
import styles from "./MeetModal.module.css";

export const MeetModal = () => {
  const { hash } = useParams();
  const isOpen = useMeetContext(state => state.isModalOpen);
  const setIsOpen = useMeetContext(state => state.setIsModalOpen);
  const setIsEditingMode = useMeetContext(store => store.setIsEditing);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");
  const { mutate } = useSaveUserSelectedData(hash || "", () => {
    setIsEditingMode(false);
    setIsOpen(false);
    setError("");
  });

  const handleSelectedSlots = () => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    if (inputEl.value.trim() === "") {
      setError("Необходимо ввести ваше имя");
      return;
    }

    mutate(inputEl.value.trim());
  };

  return (
    <>
      <ModalWrapper isAnimate animationDuration={300} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div data-test-id='meet-modal' className={styles.MeetModal}>
          <h3 className={styles.MeetModal__Title}>Введите ваше имя</h3>
          <Input
            error={error}
            inputRef={inputRef}
            placeholder='Иван Иванов'
            label='Введите ваше имя'
            name='userName'
            onChange={() => {
              setError("");
            }}
            autoComplete='given-name'
          />
          <button onClick={handleSelectedSlots} className={styles.MeetModal__SaveButton}>
            Сохранить
          </button>
        </div>
      </ModalWrapper>
    </>
  );
};
