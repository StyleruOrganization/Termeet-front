import { useRef } from "react";
import styles from "./PhotoPicker.module.css";

interface PhotoPickerProps {
  src?: string | null;
  label: string;
  hint?: string;
  disabled?: boolean;
  onFile: (file: File) => void;
}

export const PhotoPicker = ({ src, label, hint, disabled, onFile }: PhotoPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.PhotoPicker}>
      <button
        type='button'
        className={styles.PhotoPicker__Button}
        disabled={disabled}
        aria-label={label}
        onClick={() => inputRef.current?.click()}
      >
        {src ? (
          <img src={src} alt='' className={styles.PhotoPicker__Image} />
        ) : (
          <span className={styles.PhotoPicker__Placeholder} aria-hidden>
            +
          </span>
        )}
      </button>
      <div className={styles.PhotoPicker__Meta}>
        <span className={styles.PhotoPicker__Label}>{label}</span>
        {hint ? <span className={styles.PhotoPicker__Hint}>{hint}</span> : null}
      </div>
      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp'
        className={styles.PhotoPicker__Input}
        disabled={disabled}
        onChange={event => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            onFile(file);
          }
        }}
      />
    </div>
  );
};
