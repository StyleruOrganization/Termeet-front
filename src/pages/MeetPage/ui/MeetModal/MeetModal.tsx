import { useRef, useState } from "react";
import { ModalWrapper, Input } from "@/shared/ui";
import { useMeetContext } from "@entities/Meet";
import styles from "./MeetModal.module.css";

export const MeetModal = () => {
  const isOpen = useMeetContext(state => state.isModalOpen);
  const setIsOpen = useMeetContext(state => state.setIsModalOpen);
  const saveSelectedSlots = useMeetContext(state => state.saveNewSelectedSlots);
  const setIsEditingMode = useMeetContext(store => store.setIsEditing);
  const clearNewSelectedSlots = useMeetContext(store => store.clearNewSelectedSlots);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");

  const handleSelectedSlots = () => {
    const inputEl = inputRef.current;
    if (!inputEl) return;

    if (inputEl.value.trim() === "") {
      setError("Необходимо ввести ваше имя");
      return;
    }

    saveSelectedSlots(inputEl.value);
    clearNewSelectedSlots();
    setIsEditingMode(false);
    setIsOpen(false);
    setError("");
  };

  return (
    <>
      <ModalWrapper isAnimate animationDuration={300} isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className={styles.MeetModal}>
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
          />
          <button onClick={handleSelectedSlots} className={styles.MeetModal__SaveButton}>
            Сохранить
          </button>
        </div>
      </ModalWrapper>
    </>
  );
};
