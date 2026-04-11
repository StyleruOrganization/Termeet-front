import { useState, useRef } from "react";
import styles from "./Toggle.module.css";

interface ToggleProps {
  LeftLabel: React.ReactNode;
  RightLabel: React.ReactNode;
  onChange?: (value: "left" | "right") => void;
  defaultActive?: "left" | "right";
  className?: string;
  classNameActive?: string;
  classNameOptions?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  LeftLabel,
  RightLabel,
  onChange,
  className,
  classNameActive,
  classNameOptions,
  defaultActive = "left",
}) => {
  const [active, setActive] = useState<"left" | "right">(defaultActive);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLButtonElement>(null);
  const rightRef = useRef<HTMLButtonElement>(null);

  const setActiveValue = (value: "left" | "right") => {
    setActive(value);
    onChange?.(value);
  };

  const handleClick = (value: "left" | "right") => {
    setActiveValue(value);
  };

  return (
    <div className={`${className} ${styles.ToogleContainer}`} ref={containerRef}>
      <button
        ref={leftRef}
        className={`${classNameOptions} ${styles.Toogle__Option} ${active === "left" ? `${classNameActive} ${styles.Toogle__Option_active}` : ""}`}
        onClick={() => handleClick("left")}
      >
        {LeftLabel}
      </button>
      <button
        ref={rightRef}
        className={`${classNameOptions} ${styles.Toogle__Option} ${active === "right" ? `${classNameActive} ${styles.Toogle__Option_active}` : ""}`}
        onClick={() => handleClick("right")}
      >
        {RightLabel}
      </button>
    </div>
  );
};

export default Toggle;
