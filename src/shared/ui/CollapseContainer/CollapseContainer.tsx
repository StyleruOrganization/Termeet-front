import { useEffect, useState } from "react";
import Arrow from "@/assets/icons/arrow.svg";
import styles from "./CollapseContainer.module.css";

interface CollapseContainerProps {
  Title: React.ReactNode;
  Content: React.ReactNode;
  maxHeight: number;
  initialExpanded?: boolean;
  disabled?: boolean;
}
export const CollapseContainer = ({
  Title,
  Content,
  maxHeight,
  disabled = false,
  initialExpanded = false,
}: CollapseContainerProps) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  useEffect(() => {
    setIsExpanded(initialExpanded);
  }, [initialExpanded]);

  return (
    <>
      <div
        style={
          // Анимирую max-height поэтому надо посчитать
          {
            "--max-height": `${maxHeight}px`,
          } as React.CSSProperties
        }
        className={`${styles.CollapseContainer} ${isExpanded ? styles.CollapseContainer__expanded : ""}`}
      >
        <div className={styles.CollapseContainer__Title}>
          {Title}
          <button
            onClick={() => {
              setIsExpanded(prev => !prev);
            }}
            className={styles.CollapseContainer__ExpandButton}
            disabled={disabled}
          >
            <Arrow />
          </button>
        </div>
        <div className={styles.CollapseContainer__Content}>{Content}</div>
      </div>
    </>
  );
};
