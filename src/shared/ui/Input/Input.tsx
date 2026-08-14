import { forwardRef, useState } from "react";
import EyeOffIcon from "@assets/icons/eye-off.svg";
import EyeIcon from "@assets/icons/eye.svg";
import styles from "./Input.module.css";
import type { IInputProps } from "./Input.types";

export const Input = forwardRef<HTMLInputElement, IInputProps>(
  (
    {
      label,
      placeholder,
      name,
      error,
      onChange,
      readOnly = false,
      className,
      suggestMessage,
      classNameInputWrapper,
      type = "text",
      ...inputProps
    },
    ref,
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === "password";

    return (
      <div className={`${styles.Input} ${className} ${error ? styles.Input__Error : ""}`}>
        {label && (
          <label className={styles.Input__Label} htmlFor={name}>
            {label}
          </label>
        )}
        <div className={`${styles.Input__FieldWrap} ${classNameInputWrapper ?? ""}`}>
          <input
            {...inputProps}
            ref={ref}
            type={isPasswordField && isPasswordVisible ? "text" : type}
            onChange={onChange}
            id={name}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`${styles.Input__Field} ${isPasswordField ? styles.Input__Field_withToggle : ""}`}
          />
          {isPasswordField && (
            <button
              className={styles.Input__TogglePassword}
              type='button'
              aria-label={isPasswordVisible ? "Скрыть пароль" : "Показать пароль"}
              onClick={() => setIsPasswordVisible(visible => !visible)}
            >
              {isPasswordVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>

        {!inputProps.value && !error && suggestMessage && (
          <span className={styles.Input__SuggestField}>{suggestMessage}</span>
        )}
        {error && <span className={styles.Input__ErrorField}>{error}</span>}
      </div>
    );
  },
);
