import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./Toogle.module.css";

interface ToggleProps {
  leftLabel: string;
  rightLabel: string;
  onChange?: (value: "left" | "right") => void;
  defaultActive?: "left" | "right";
}

export const Toggle: React.FC<ToggleProps> = ({ leftLabel, rightLabel, onChange, defaultActive = "left" }) => {
  const [active, setActive] = useState<"left" | "right">(defaultActive);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);

  // Обновление позиции слайдера
  const updateSliderPosition = useCallback(() => {
    const activeElement = active === "left" ? leftRef.current : rightRef.current;
    const container = containerRef.current;

    if (activeElement && container) {
      const containerRect = container.getBoundingClientRect();
      const activeRect = activeElement.getBoundingClientRect();

      setSliderStyle({
        left: activeRect.left - containerRect.left,
        width: activeRect.width,
      });
    }
  }, [active]);

  const setActiveValue = (value: "left" | "right") => {
    setActive(value);
    onChange?.(value);
  };

  const handleClick = (value: "left" | "right") => {
    setActiveValue(value);
  };

  // Обновляем позицию при изменении active или ресайзе
  useEffect(() => {
    updateSliderPosition();
  }, [active, leftLabel, rightLabel, updateSliderPosition]);

  useEffect(() => {
    window.addEventListener("resize", updateSliderPosition);
    return () => window.removeEventListener("resize", updateSliderPosition);
  }, [updateSliderPosition]);

  return (
    <div className={styles.ToogleContainer} ref={containerRef}>
      <button
        ref={leftRef}
        className={`${styles.Toogle__Option} ${active === "left" ? styles.Toogle__Option_active : ""}`}
        onClick={() => handleClick("left")}
      >
        {leftLabel}
      </button>
      <button
        ref={rightRef}
        className={`${styles.Toogle__Option} ${active === "right" ? styles.Toogle__Option_active : ""}`}
        onClick={() => handleClick("right")}
      >
        {rightLabel}
      </button>
      <div
        className={styles.Toogle__Slider}
        style={{
          transform: `translateX(${sliderStyle.left - 4}px)`,
          width: `${sliderStyle.width}px`,
        }}
      />
    </div>
  );
};

export default Toggle;
