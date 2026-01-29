import { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronDown, Check } from "@assets/icons";
import styles from "./Select.module.css";
import { Input } from "../Input/Input";
import type { TimeSelectProps } from "./Select.types";
import type { Meeting } from "@/shared/types/CreateMeeting.types";

const DROPDOWN_HEIGHT = 240;

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
  const [dropdownPosition, setDropdownPosition] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    setValue,
    watch,
    trigger,
    formState: { isDirty },
  } = useFormContext<Meeting>();
  const fieldValue = watch(name);

  useEffect(() => {
    const input = dropdownRef.current;
    if (!input) return;

    const positions = input.getBoundingClientRect();

    const spaceBelow = document.documentElement.clientHeight - positions.bottom;

    setTimeout(() => {
      if (spaceBelow >= DROPDOWN_HEIGHT) {
        setDropdownPosition("100% + 8px");
      } else {
        setDropdownPosition("-240px - 8px");
      }
    }, 0);
  }, [isOpen]);

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

  useEffect(() => {
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
    <div
      style={
        {
          "--dropdown-ofset": dropdownPosition,
        } as React.CSSProperties
      }
      className={styles.TimeSelect}
      ref={dropdownRef}
    >
      <Input
        name={name}
        onChange={handleChange}
        label={label}
        placeholder={placeholder}
        readOnly={readonly}
        error={error}
      />
      {showSuccess && !error && <Check className={styles.TimeSelect__SuccessIcon} />}
      <button
        type='button'
        className={styles.TimeSelect__Toggle}
        onClick={toggleDropdown}
        aria-label='Открыть список времени'
        data-test-id={"select-toggle-" + name}
      >
        <ChevronDown className={`${styles.TimeSelect__OpenIcon} ${isOpen ? styles.TimeSelect__Icon_open : ""}`} />
      </button>
      {isOpen && (
        <div className={styles.TimeSelect__Dropdown}>
          <ul className={styles.TimeSelect__List}>
            {options.map(time => (
              <li key={time} className={styles.TimeSelect__Item}>
                <button
                  type='button'
                  className={`${styles.TimeSelect__Option} ${fieldValue === time ? styles.TimeSelect__Option_selected : ""}`}
                  data-test-id={"select-option-" + name}
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
