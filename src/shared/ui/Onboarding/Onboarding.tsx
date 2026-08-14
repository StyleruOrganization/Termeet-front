import { useEffect, useState } from "react";
import CongratulationIcon from "@assets/icons/congratulate.svg";
import styles from "./Onboarding.module.css";
import { CollapseContainer } from "../CollapseContainer/CollapseContainer";

export interface OnboardingProps {
  items: { text: string; id: string; subtitle?: string }[];
  completedItems: string[];
  title: string;
  CongratulationContent?: React.ReactNode;
  onHide?: () => void;
}

export const Onboarding = ({ items, title, completedItems, CongratulationContent, onHide }: OnboardingProps) => {
  const allCompleted = items.length === completedItems.length;
  const [showCongratulations, setShowCongratulations] = useState(false);

  useEffect(() => {
    if (allCompleted) {
      const timer = setTimeout(() => {
        setShowCongratulations(true);
      }, 400);

      return () => clearTimeout(timer);
    } else {
      setShowCongratulations(false);
    }
  }, [allCompleted]);

  const hideButtonHeight = onHide && !showCongratulations ? 28 : 0;
  const stepsHeight = 25 * items.length + 8 * Math.max(items.length - 1, 0) + hideButtonHeight;

  return (
    <CollapseContainer
      className={styles.Onboarding}
      Title={<h3 className={styles.Onboarding__Title}>{title}</h3>}
      Content={
        <div className={styles.Onboarding__ContainerItems}>
          {!showCongratulations ? (
            <>
              {items.map(({ text, id }, index) => (
                <div className={styles.Onboarding__Item} key={id}>
                  <div
                    className={
                      styles.Onboarding__Item__Marker +
                      " " +
                      (completedItems.includes(id) ? styles.Onboarding__Item__Marker_Filled : "")
                    }
                  >
                    {index + 1}
                  </div>
                  <span className={styles.Onboarding__Item__Text}>{text}</span>
                </div>
              ))}
              {onHide ? (
                <button type='button' className={styles.Onboarding__Hide} onClick={onHide}>
                  Больше не показывать
                </button>
              ) : null}
            </>
          ) : (
            <div className={styles.CongratulationContainer}>
              <CongratulationIcon />
              <span className={styles.Onboarding__Congratulate__Text}>{CongratulationContent}</span>
            </div>
          )}
        </div>
      }
      initialExpanded
      maxHeight={showCongratulations ? 108 : stepsHeight}
    />
  );
};
