import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useToastStore } from "@/features/ToastContainer";
import { ModalWrapper } from "@/shared/ui";
import AccordeonIcon from "@assets/icons/accordeon.svg";
import Arrow from "@assets/icons/arrow.svg";
import Pencil from "@assets/icons/pencil.svg";
import styles from "./MeetHeader.module.css";
import { copyTextToClipboard } from "../../lib/clipboard/copyToClipBoard";
import type { MeetHeaderProps } from "./MeetHeader.types";

const WINDOW_WIDTH = window.innerWidth;

export const MeetHeader = ({ duration, description, name, link }: MeetHeaderProps) => {
  // isExpanded = true - описание раскрыто
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDescPopupOpen, setIsDescPopupOpen] = useState(false);
  const addToast = useToastStore(store => store.addToast);
  const navigate = useNavigate();
  const { hash = "" } = useParams();
  const [scrollY, setScrollY] = useState(() => window.scrollY);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY < 50) {
        setScrollY(window.scrollY);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Очистка
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  console.log("isDescPopupOpen", isDescPopupOpen);
  return (
    <div
      style={{
        transform: WINDOW_WIDTH < 768 ? `translateY(-${Math.min(scrollY, 46)}px)` : "",
      }}
      className={`${styles.MeetHeader} ${isExpanded ? styles.MeetHeader__expanded : ""}`}
    >
      <div className={styles.MeetHeader__Info}>
        <span className={styles.MeetHeader__Info__Title}>{name}</span>
        <span className={styles.MeetHeader__Info__Duration}>{duration}</span>
        <button
          onClick={() => {
            navigate(`/meet/edit/${hash}`);
          }}
          className={styles.MeetHeader__Info__Button}
        >
          <Pencil />
        </button>
        {description && (
          <button
            onClick={() => {
              if (WINDOW_WIDTH < 768) {
                setIsDescPopupOpen(true);
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
      >
        <div className={styles.MeetHeader__modalWrapper}>
          <div className={styles.MeetHeader__modalTitle}>Описание встречи</div>
          <p>{description}</p>
        </div>
      </ModalWrapper>
    </div>
  );
};
