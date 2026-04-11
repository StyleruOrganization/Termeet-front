import { forwardRef } from "react";
import styles from "./Input.module.css";
import type { IInputProps } from "./Input.types";

export const Input = forwardRef<HTMLInputElement, IInputProps>(
  ({ label, placeholder, name, error, onChange, readOnly = false, className, suggestMessage, ...inputProps }, ref) => {
    return (
      <div className={`${styles.Input} ${error ? styles.Input__Error : ""}`}>
        {label && (
          <label className={styles.Input__Label} htmlFor={name}>
            {label}
          </label>
        )}
        <div className={className}>
          <input
            {...inputProps}
            ref={ref}
            onChange={onChange}
            id={name}
            name={name}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`${styles.Input__Field}`}
          />
        </div>

        {!inputProps.value && !error && suggestMessage && (
          <span className={styles.Input__SuggestField}>{suggestMessage}</span>
        )}
        {error && <span className={styles.Input__ErrorField}>{error}</span>}
      </div>
    );
  },
);
