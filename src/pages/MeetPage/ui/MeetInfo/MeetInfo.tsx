import { useEffect, useState } from "react";
import { useMeetStore } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import ApproveIcon from "@assets/icons/approve.svg";
import CancelIcon from "@assets/icons/cross.svg";
import LinkIcon from "@assets/icons/link.svg";
import { copyTextToClipboard } from "@shared/libs";
import { MeetHeader } from "../MeetHeader";
import { MeetModal } from "../MeetModal";
import { MeetPeoples } from "../MeetPeoples";
import styles from "./MeetInfo.module.css";
import type { IMeetInfoProps } from "./MeetInfo.types";

const WINDOW_WIDTH = window.innerWidth;

export const MeetInfo = ({ data }: IMeetInfoProps) => {
  const isEditingMode = useMeetStore(store => store.isEditing),
    setIsEditing = useMeetStore(store => store.setIsEditing),
    newSelectedSlots = useMeetStore(store => store.newSelectedSlots),
    setIsModalOpen = useMeetStore(store => store.setIsModalOpen),
    clearNewSelectedSlots = useMeetStore(store => store.clearNewSelectedSlots);

  console.log("NEW selectedSlots in MeetInfo", newSelectedSlots);
  const addToast = useToastStore(store => store.addToast);
  // Состояние для управления transition
  const [disableTransition, setDisableTransition] = useState(false);

  console.log("disableTransition", disableTransition);

  // Отключаем transition при входе в режим редактирования
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isEditingMode) {
      // Сбрасываем предыдущий таймер если есть
      setDisableTransition(true);

      timer = setTimeout(() => {
        setDisableTransition(false);
      }, 300);
    } else {
      // При выходе из режима редактирования сразу включаем transition обратно
      setDisableTransition(true);

      timer = setTimeout(() => {
        setDisableTransition(false);
      }, 300);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isEditingMode]);

  const transitionStyle = disableTransition
    ? "none"
    : "background-color 0.3s ease-in-out, color 0.3s ease-in-out, opacity 0.3s ease-in-out";

  return (
    <>
      <div className={styles.MeetInfo}>
        <div className={styles.MeetInfo__HeaderWrapper}>
          <MeetHeader duration={data.duration} description={data.description} name={data.name} link={data.link} />
        </div>
        <MeetPeoples users={data.users} />
        <div className={styles.MeetInfo__Buttons}>
          {!isEditingMode ? (
            <button
              onClick={() => {
                copyTextToClipboard(window.location.href, addToast);
              }}
              className={styles.MeetInfo__ShareButton}
            >
              <LinkIcon />
              {WINDOW_WIDTH < 768 ? "Поделиться встречей" : ""}
            </button>
          ) : null}
          <div className={styles.MeetInfo__ButtonsEdit}>
            {isEditingMode ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    clearNewSelectedSlots();
                  }}
                  className={`baseButton cancelButton`}
                  style={{
                    transition: transitionStyle,
                  }}
                >
                  <CancelIcon className={styles.MeetInfo__CancelIcon} /> <span>Отменить</span>
                </button>
                <button
                  disabled={!newSelectedSlots.size}
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                  className={`baseButton approveButton`}
                  style={{
                    transition: transitionStyle,
                  }}
                >
                  <ApproveIcon />
                  <span>Сохранить</span>
                </button>
              </>
            ) : (
              <>
                {/* <button className={"baseButton secondaryButton"}>Назначить встречу</button> */}
                <button
                  onClick={() => {
                    setIsEditing(true);
                  }}
                  className={`baseButton mainButton ${styles.MeetInfo__AddTimeButton}`}
                  style={{
                    transition: transitionStyle,
                  }}
                >
                  Добавить время
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <MeetModal />
    </>
  );
};
