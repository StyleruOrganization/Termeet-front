import { ErrorIcon } from "@assets/icons";
import styles from "./TextArea.module.css";
import type { ITextAreaProps } from "./TextArea.types";

export const TextArea = ({ name, placeholder, label, error, ...textAreaProps }: ITextAreaProps) => {
  return (
    <div className={styles.TextArea + (error ? " " + styles.TextArea__Error : "")}>
      <label className={styles.TextArea__Label} htmlFor={name}>
        {label}
      </label>
      <textarea
        {...textAreaProps}
        id={name}
        className={styles.TextArea__Field}
        name={name}
        placeholder={placeholder}
        autoComplete='off'
      />
      {error && (
        <div className={styles.TextArea__ErrorField}>
          <ErrorIcon />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
