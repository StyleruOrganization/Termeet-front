import { forwardRef } from "react";
import { ErrorIcon } from "@assets/icons";
import styles from "./Input.module.css";
import type { IInputProps } from "./Input.types";

export const Input = forwardRef<HTMLInputElement, IInputProps>(
  ({ label, placeholder, name, error, onChange, readOnly = false, className = "", inputRef, ...props }, ref) => {
    const resolvedRef = inputRef ?? ref;
    return (
      <div className={`${styles.Input} ${error ? styles.Input__Error : ""}`}>
        {label && (
          <label className={styles.Input__Label} htmlFor={name}>
            {label}
          </label>
        )}
        <input
          {...props}
          ref={resolvedRef}
          onChange={onChange}
          id={name}
          name={name}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`${styles.Input__Field} ${className}`}
        />
        {error && (
          <div data-test-id='error-field' className={styles.Input__ErrorField}>
            <ErrorIcon />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  },
);
