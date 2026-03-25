import styles from "./TextArea.module.css";
import type { ITextAreaProps } from "./TextArea.types";

export const TextArea = ({ name, placeholder, label, error, suggestMessage, ...textAreaProps }: ITextAreaProps) => {
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
      {!textAreaProps.value && !error && suggestMessage && (
        <span className={styles.TextArea__SuggestField}>{suggestMessage}</span>
      )}
      {error && <span className={styles.TextArea__ErrorField}>{error}</span>}
    </div>
  );
};
