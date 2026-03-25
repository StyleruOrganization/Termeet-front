import { useState } from "react";
import { useToastStore } from "@/features/ToastContainer";
import Arrow from "@assets/icons/arrow.svg";
import Pencil from "@assets/icons/pencil.svg";
import styles from "./MeetHeader.module.css";
import { getFormattedDuration } from "../../lib";
import { copyTextToClipboard } from "../../lib/clipboard/copyToClipBoard";
import type { MeetHeaderProps } from "./MeetHeader.types";

export const MeetHeader = ({ duration, description, name, link }: MeetHeaderProps) => {
  // isExpanded = true - описание раскрыто
  const [isExpanded, setIsExpanded] = useState(false);
  const formattedDuration = getFormattedDuration(duration || "");
  const addToast = useToastStore(store => store.addToast);

  return (
    <div className={`${styles.MeetHeader} ${isExpanded ? styles.MeetHeader__expanded : ""}`}>
      <div className={styles.MeetHeader__Info}>
        <span className={styles.MeetHeader__Info__Title}>{name}</span>
        <span className={styles.MeetHeader__Info__Duration}>{formattedDuration}</span>
        <button className={styles.MeetHeader__Info__Button}>
          <Pencil />
        </button>
        {description && (
          <button
            onClick={() => {
              setIsExpanded(prev => !prev);
            }}
            className={styles.MeetHeader__Info__Button + " " + styles.MeetHeader__Info__ExpandButton}
          >
            <Arrow />
          </button>
        )}
      </div>
      {description && <div className={styles.MeetHeader__desc}>{description}</div>}
      {link && (
        <a
          className={styles.MeetHeader__link}
          onClick={event => {
            event.preventDefault();

            copyTextToClipboard(link, addToast);
          }}
        >
          Ссылка на встречу
        </a>
      )}
    </div>
  );
};
