import TgOutlineIcon from "@assets/icons/tg-outline.svg";
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
  className,
  style,
}: (typeof TEAM_MEMBERS)[0] & { className?: string; style?: Record<string, string> }) => {
  return (
    <div style={{ ...style }} className={`${styles.TeamMemberCard} ${className}`}>
      <div className={styles.TeamMemberCard__Photo}>
        <img src={photo} alt={`${name} photo`} />
      </div>

      <div className={styles.TeamMemberCard__Info}>
        <h3>{name}</h3>
        <span className={styles.TeamMemberCard__Info__Role}>{role}</span>
      </div>
      <p>{description}</p>
      <div className={styles.TeamMemberCard__Contacts}>
        <a href={telegramContact}>
          <TgOutlineIcon />
          Telegram
        </a>
        <a href={`mailto:${email}`}>Email</a>
        {portfolioLink ? <a href={portfolioLink}>Portfolio</a> : null}
      </div>
    </div>
  );
};
