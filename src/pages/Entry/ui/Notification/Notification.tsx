import { useEffect, useState } from "react";
import styles from "./Notification.module.css";
import type React from "react";

interface NotificationProps {
  title: string;
  description: string;
  time: string;
  className?: string;
  position: number;
  Icon: React.ReactNode;
  total: number;
  animationDelay: number;
  /** Триггер: начать анимацию только когда секция попала в viewport */
  inView: boolean;
}

const STACK_OFFSET_X = 24;
const STACK_SCALE_STEP = 0.1;
const NOTIFICATION_HEIGHT = 104;

const getOffsetY = (position: number) => {
  if (position === 0) {
    return 0;
  }

  return Array.from({ length: position }, (_, i) => i).reduce(
    (acc, _, i) => acc + NOTIFICATION_HEIGHT * (1 - STACK_SCALE_STEP * (i + 1)),
    0,
  );
};

export const Notification = ({
  title,
  description,
  time,
  Icon,
  className,
  position,
  total,
  animationDelay,
  inView,
}: NotificationProps) => {
  const [phase, setPhase] = useState<"hidden" | "animating">("hidden");

  const stackOffsetY = getOffsetY(position);
  const stackOffsetX = (position * STACK_OFFSET_X) / 2;
  const stackScale = 1 - position * STACK_SCALE_STEP;
  const zIndex = total - position;

  useEffect(() => {
    if (!inView) {
      setPhase("hidden");
      return;
    }

    const animTimer = setTimeout(() => {
      setPhase("animating");
    }, animationDelay);

    return () => clearTimeout(animTimer);
  }, [inView, animationDelay]);

  const classNames = [styles.Notification, phase === "animating" ? styles.Notification_visible : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      style={
        {
          "--stack-offset-y": `${stackOffsetY}px`,
          "--stack-offset-x": `${stackOffsetX}px`,
          "--stack-scale": stackScale,
          "--base-font-size": `${13 - 1 * position}px`,
          "--icon-size": `${36 - 6 * position}px`,
          zIndex,
        } as React.CSSProperties
      }
    >
      <div className={styles.Notification__Icon}>{Icon}</div>
      <div className={styles.Notification__Content}>
        <div className={styles.Notification__Content__GIWrapper}>
          <span className={styles.Notification__Content__Title}>{title}</span>
          <span className={styles.Notification__Content__Time}>{time}</span>
        </div>
        <span className={styles.Notification__Content__Description}>{description}</span>
      </div>
    </div>
  );
};
