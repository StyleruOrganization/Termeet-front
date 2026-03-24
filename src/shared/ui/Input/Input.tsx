import { forwardRef } from "react";
import styles from "./Input.module.css";
import type { IInputProps } from "./Input.types";

export const Input = forwardRef<HTMLInputElement, IInputProps>(
  ({ label, placeholder, name, error, onChange, readOnly = false, className = "", suggestMessage, ...props }, ref) => {
    return (
      <div className={`${styles.Input} ${error ? styles.Input__Error : ""}`}>
        {label && (
          <label className={styles.Input__Label} htmlFor={name}>
            {label}
          </label>
        )}
        <input
          {...props}
          ref={ref}
          onChange={onChange}
          id={name}
          name={name}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`${styles.Input__Field} ${className}`}
        />
        {(suggestMessage || error) && (
          <span className={error ? styles.Input__ErrorField : styles.Input__SuggestField}>
            {error || suggestMessage}
          </span>
        )}
      </div>
    );
  },
);
