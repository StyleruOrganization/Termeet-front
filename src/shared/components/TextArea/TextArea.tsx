import { useFormContext } from "react-hook-form";
import { ErrorIcon } from "@assets/icons";
import styles from "./TextArea.module.css";
import type { TextAreaProps } from "./TextArea.types";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

export const TextArea = ({ name, placeholder, label, error }: TextAreaProps) => {
  const { register } = useFormContext<Meeting>();
  return (
    <div className={styles.TextArea + (error ? " " + styles.TextArea__Error : "")}>
      <label className={styles.TextArea__Label} htmlFor={name}>
        {label}
      </label>
      <textarea
        {...register(name)}
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
