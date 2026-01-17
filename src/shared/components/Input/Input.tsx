import { useFormContext } from "react-hook-form";
import ErrorIcon from "@assets/icons/error.svg";
import styles from "./Input.module.css";
import type { InputProps } from "./Input.types";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

export const Input = ({
  label,
  placeholder,
  name,
  error,
  onChange: onChangeExternal,
  readOnly = false,
}: InputProps) => {
  const { register } = useFormContext<Meeting>();
  const { onChange, ...inputProps } = register(name);
  return (
    <div className={styles.Input + (error !== undefined ? " " + styles.Input__Error : "")}>
      <label className={styles.Input__Label} htmlFor={name}>
        {label}
      </label>
      <input
        {...inputProps}
        onChange={event => {
          onChangeExternal?.(event);
          onChange?.(event);
        }}
        id={name}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`${styles.Input__Field}`}
      />
      {error && (
        <div className={styles.Input__ErrorField}>
          <ErrorIcon />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
