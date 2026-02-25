import { useShallow } from "zustand/shallow";
import { LinkIcon, ClockIcon, PencilIcon } from "@assets/icons";
import { useMeetContext } from "@entities/Meet";
import styles from "./MeetHeader.module.css";
import { getFormattedDuration } from "../../lib";
import type { MeetHeaderProps } from "./MeetHeader.types";

export const MeetHeader = ({ duration, description, name }: MeetHeaderProps) => {
  const setIsEditingMode = useMeetContext(store => store.setIsEditing);
  const isEditing = useMeetContext(store => store.isEditing);
  const clearNewSelectedSlots = useMeetContext(store => store.clearNewSelectedSlots);
  const setIsModalOpen = useMeetContext(store => store.setIsModalOpen);
  const newSelectedSlotsEmpty = useMeetContext(
    useShallow(store => {
      const newSelectedSlotsEntries = Array.from(store.newSelectedSlots.entries());
      let isEmpty = true;
      newSelectedSlotsEntries.forEach(entry => {
        if (entry[1].length > 0) {
          isEmpty = false;
        }
      });
      return isEmpty;
    }),
  );
  const formattedDuration = getFormattedDuration(duration || "");

  return (
    <div className={styles.MeetHeader}>
      <div className={styles.MeetHeader__Info}>
        <div className={styles.MeetHeader__Info__Wrapper}>
          <div className={styles.MeetHeader__Info__Title}>
            <h2 data-test-id='meet-name'>{name}</h2>
            <button className={styles.MeetHeader__Info__Title__EditButton}>
              <PencilIcon />
            </button>
          </div>
          <div className={styles.MeetHeader__Info__Desc} data-test-id='meet-description'>
            {description}
          </div>
          <span className={styles.MeetHeader__Info__DurationBadge}>
            <ClockIcon />
            <span>{formattedDuration}</span>
          </span>
        </div>
        <button className={styles.Button + " " + styles.MeetHeader__Info__Share}>
          <LinkIcon />
          <span>Поделиться</span>
        </button>
      </div>
      <div className={styles.MeetHeader__Time}>
        <div className={styles.MeetHeader__Time__Title}>Выбор времени</div>
        <button
          onClick={() => {
            setIsEditingMode(false);
            clearNewSelectedSlots();
          }}
          className={styles.Button + " " + styles.MeetHeader__Time__Final}
          data-test-id='cancel-meet-button'
        >
          {isEditing ? "Отмена" : "Выбрать итоговое время"}
        </button>
        <button
          onClick={() => {
            if (!isEditing) {
              setIsEditingMode(true);
            } else {
              setIsModalOpen(true);
            }
          }}
          disabled={isEditing && newSelectedSlotsEmpty}
          className={styles.Button + " " + styles.MeetHeader__Time__Choose}
          data-test-id='edit-mode-meet-button'
        >
          {isEditing ? "Сохранить" : "Выбрать время"}
        </button>
      </div>
    </div>
  );
};
