import { useTranslation } from "@/shared/i18n";
import styles from "./Card.module.css";

interface ReasonCardProps {
  children: React.ReactNode;
  title: string;
  description: string;
  scrollSnapType?: "start" | "end";

  type: "reason" | "advantage";
  onTry?: () => void;
}

export const Card = ({ children, title, description, scrollSnapType: customScrollSnapType, type, onTry }: ReasonCardProps) => {
  const { t } = useTranslation();
  return (
    <div style={{ scrollSnapAlign: customScrollSnapType }} className={`${styles.ReasonCard} ${styles[type]}`}>
      {children}
      <div className={styles.ReasonCard__ContentWrapper}>
        <h3>{title}</h3>
        <p>{description}</p>
        {onTry ? (
          <button type='button' className={styles.ReasonCard__Action} onClick={onTry}>
            {t("entry.try")}
          </button>
        ) : (
          <a href=''>{t("entry.try")}</a>
        )}
      </div>
    </div>
  );
};
