import styles from "./Card.module.css";

interface ReasonCardProps {
  children: React.ReactNode;
  title: string;
  description: string;
  scrollSnapType?: "start" | "end";

  type: "reason" | "advantage";
}

export const Card = ({ children, title, description, scrollSnapType: customScrollSnapType, type }: ReasonCardProps) => {
  return (
    <div style={{ scrollSnapAlign: customScrollSnapType }} className={`${styles.ReasonCard} ${styles[type]}`}>
      {children}
      <div className={styles.ReasonCard__ContentWrapper}>
        <h3>{title}</h3>
        <p>{description}</p>
        <a href=''>Попробовать →</a>
      </div>
    </div>
  );
};
