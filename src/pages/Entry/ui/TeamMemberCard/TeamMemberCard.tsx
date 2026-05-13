import { useRef } from "react";
import { useToastStore } from "@/features/ToastContainer";
import TgOutlineIcon from "@assets/icons/tg-outline.svg";
import { copyTextToClipboard } from "@shared/libs";
import { useInView } from "@shared/libs/hooks/useinView";
import { TEAM_MEMBERS } from "./../../lib/consts/consts";
import styles from "./TeamMemberCard.module.css";

export const TeamMemberCard = ({
  name,
  role,
  photo,
  telegramContact,
  description,
  email,
  portfolioLink,
  cv,
  className,
  style,
}: (typeof TEAM_MEMBERS)[0] & { className?: string; style?: Record<string, string> }) => {
  const addToast = useToastStore(state => state.addToast);
  const cardRef = useRef<HTMLDivElement>(null);
  const { hasBeenSeen } = useInView(cardRef, 0.1);

  const handleCopyEmail = (email: string) => {
    copyTextToClipboard(email, addToast, "Email скопирован", "Ошибка при копировании email");
  };
  return (
    <div
      ref={cardRef}
      style={{ ...style }}
      className={`${styles.TeamMemberCard} ${className} ${hasBeenSeen ? styles.TeamMemberCard_visible : ""}`}
    >
      <div className={styles.TeamMemberCard__Photo}>
        <img src={photo} alt={`${name} photo`} />
      </div>

      <div className={styles.TeamMemberCard__Info}>
        <h3>{name}</h3>
        <span className={styles.TeamMemberCard__Info__Role}>{role}</span>
      </div>
      <p>{description}</p>
      <div className={styles.TeamMemberCard__Contacts}>
        <a target='_blank' href={telegramContact}>
          <TgOutlineIcon />
          Telegram
        </a>
        <a onClick={() => handleCopyEmail(email)}>Email</a>
        {portfolioLink ? (
          <a href={portfolioLink} target='_blank'>
            Portfolio
          </a>
        ) : null}
        {cv ? (
          <a href={cv} target='_blank' rel='noopener noreferrer'>
            CV
          </a>
        ) : null}
      </div>
    </div>
  );
};
