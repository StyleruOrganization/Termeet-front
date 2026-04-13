import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useToastStore } from "@/features/ToastContainer";
import { useScrollToTop, copyTextToClipboard } from "@/shared/libs";
import { ModalWrapper } from "@/shared/ui";
import AccordeonIcon from "@assets/icons/accordeon.svg";
import Arrow from "@assets/icons/arrow.svg";
import Pencil from "@assets/icons/pencil.svg";
import styles from "./MeetHeader.module.css";
import type { MeetHeaderProps } from "./MeetHeader.types";

const WINDOW_WIDTH = window.innerWidth;

export const MeetHeader = ({ duration, description, name, link }: MeetHeaderProps) => {
  // isExpanded = true - описание раскрыто
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDescPopupOpen, setIsDescPopupOpen] = useState(false);
  const [searchParams] = useSearchParams(); // Получаем текущие query-параметры
  const scrollToTop = useScrollToTop();

  const addToast = useToastStore(store => store.addToast),
    removeToast = useToastStore(store => store.removeToast);
  const navigate = useNavigate();
  const { hash = "" } = useParams();

  // Функция для навигации с сохранением query-параметров
  const navigateWithParams = (path: string) => {
    const queryString = searchParams.toString();
    const newPath = queryString ? `${path}?${queryString}` : path;
    navigate(newPath);
  };

  return (
    <div className={`${styles.MeetHeader} ${isExpanded ? styles.MeetHeader__expanded : ""}`}>
      <div className={styles.MeetHeader__Info}>
        <span className={styles.MeetHeader__Info__Title}>{name}</span>
        <span className={styles.MeetHeader__Info__Duration}>{duration}</span>
        <button
          onClick={() => {
            navigateWithParams(`/meet/edit/${hash}`);
            scrollToTop();
          }}
          className={styles.MeetHeader__Info__Button}
        >
          <Pencil />
        </button>
        {(WINDOW_WIDTH < 768 || description) && (
          <button
            onClick={() => {
              if (WINDOW_WIDTH < 768) {
                setIsDescPopupOpen(true);
                removeToast("update-meet-success");
              } else {
                setIsExpanded(prev => !prev);
              }
            }}
            className={styles.MeetHeader__Info__Button + " " + styles.MeetHeader__Info__ExpandButton}
          >
            {WINDOW_WIDTH < 768 ? <AccordeonIcon className={styles.MeetHeader__Info__AccordeonIcon} /> : <Arrow />}
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

      <ModalWrapper
        isAnimate
        animationDuration={300}
        isOpen={isDescPopupOpen}
        onClose={() => setIsDescPopupOpen(false)}
        scrollbarWidth={window.innerWidth - document.documentElement.clientWidth}
      >
        <div className={styles.MeetHeader__modalWrapper}>
          <div>
            <div className={styles.MeetHeader__modalTitle}>Название встречи</div>
            <p>{name}</p>
          </div>
          {description && (
            <div>
              <div className={styles.MeetHeader__modalTitle}>Описание встречи</div>
              <p>{description}</p>
            </div>
          )}
        </div>
      </ModalWrapper>
    </div>
  );
};
