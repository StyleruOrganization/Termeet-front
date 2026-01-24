import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useFormContext } from "react-hook-form";
import CheckIcon from "@assets/icons/check.svg";
import ChevronIcon from "@assets/icons/chevron-down.svg";
import styles from "./Select.module.css";
import { Input } from "../Input/Input";
import type { TimeSelectProps } from "./Select.types";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

export const Select = ({
  label,
  placeholder,
  options,
  name,
  error,
  formatValue,
  readonly = false,
}: TimeSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    setValue,
    watch,
    trigger,
    formState: { isDirty },
  } = useFormContext<Meeting>();
  const fieldValue = watch(name);

  // Закрытие выпадающего списка при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const el = dropdownRef.current;

      if (!el) {
        return;
      }

      if (event.target instanceof Node && !dropdownRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("click", handleClickOutside);
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useLayoutEffect(() => {
    if (!isDirty) {
      setTimeout(() => {
        setShowSuccess(false);
      }, 0);
    }
  }, [isDirty]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatValue(event.target.value as string);
    setShowSuccess(formatted.isValid);

    setValue(name, formatted.value, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    trigger(["time.start", "time.end", "time.duration"]);
  };

  return (
    <div className={styles.TimeSelect} ref={dropdownRef}>
      <Input
        name={name}
        onChange={handleChange}
        label={label}
        placeholder={placeholder}
        readOnly={readonly}
        error={error}
      />
      {showSuccess && !error && <CheckIcon className={styles.TimeSelect__SuccessIcon} />}
      <button
        type='button'
        className={styles.TimeSelect__Toggle}
        onClick={toggleDropdown}
        aria-label='Открыть список времени'
      >
        <ChevronIcon className={`${styles.TimeSelect__OpenIcon} ${isOpen ? styles.TimeSelect__Icon_open : ""}`} />
      </button>
      {isOpen && (
        <div className={styles.TimeSelect__Dropdown}>
          <ul className={styles.TimeSelect__List}>
            {options.map(time => (
              <li key={time} className={styles.TimeSelect__Item}>
                <button
                  type='button'
                  className={`${styles.TimeSelect__Option} ${fieldValue === time ? styles.TimeSelect__Option_selected : ""}`}
                  onClick={() => {
                    setValue(name, time, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                    setIsOpen(false);
                    setShowSuccess(true);
                    trigger(["time.start", "time.end", "time.duration"]);
                  }}
                >
                  {time}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
