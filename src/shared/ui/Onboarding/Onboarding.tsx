import { useEffect, useState } from "react";
import CongratulationIcon from "@assets/icons/congratulate.svg";
import styles from "./Onboarding.module.css";
import { CollapseContainer } from "../CollapseContainer/CollapseContainer";

export interface OnboardingProps {
  items: { text: string; id: string; subtitle?: string }[];
  completedItems: string[];
  title: string;
  CongratulationContent?: React.ReactNode;
}

export const Onboarding = ({ items, title, completedItems, CongratulationContent }: OnboardingProps) => {
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
  console.log("Items", items);
  console.log("completedItems in Base Onboarding", completedItems);
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
      maxHeight={items.length == completedItems.length ? 108 : 25 * items.length + 8 * (items.length - 1)}
    />
  );
};
