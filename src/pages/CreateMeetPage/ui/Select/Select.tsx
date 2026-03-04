import { useState, useRef, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useFocusTrap } from "@/shared/libs";
import { ChevronDown, Check } from "@assets/icons";
import { InputForm } from "@features/InputForm";
import styles from "./Select.module.css";
import type { TimeSelectProps } from "./Select.types";
import type { ICreateMeet } from "../../model";

const DROPDOWN_HEIGHT = 258;

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
  const selectRef = useRef<HTMLDivElement>(null);
  const {
    setValue,
    watch,
    trigger,
    formState: { isDirty },
  } = useFormContext<ICreateMeet>();
  useFocusTrap(dropdownRef, isOpen, () => setIsOpen(false));
  const timeValues = watch("time");
  console.log("fieldValue in Select", timeValues);
  console.log("name in Select", name);

  useEffect(() => {
    if (!isOpen) return;
    const input = selectRef.current;
    if (!input) return;

    const positions = input.getBoundingClientRect();

    const spaceBelow = document.documentElement.clientHeight - positions.bottom;

    setTimeout(() => {
      if (spaceBelow > DROPDOWN_HEIGHT + 8 + 5) {
        setDropdownPosition("100% + 8px");
      } else {
        setDropdownPosition("-258px - 8px");
      }
    }, 0);
  }, [isOpen]);

  // Закрытие выпадающего списка при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const el = selectRef.current;

      if (!el) {
        return;
      }

      if (event.target instanceof Node && !selectRef.current?.contains(event.target)) {
        setDropdownPosition("");
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
    setDropdownPosition("");
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

    const triggeredValues: ("time.start" | "time.end" | "time.duration")[] = [];
    if (timeValues.duration) {
      triggeredValues.push("time.duration");
    }
    if (timeValues.start) {
      triggeredValues.push("time.start");
    }
    if (timeValues.end) {
      triggeredValues.push("time.end");
    }

    console.log("triggered Values", triggeredValues);

    trigger(triggeredValues);
  };

  const key = name.split(".")[1] as "start" | "end" | "duration";

  return (
    <div
      style={
        {
          "--dropdown-ofset": dropdownPosition,
        } as React.CSSProperties
      }
      className={styles.TimeSelect}
      ref={selectRef}
    >
      <InputForm
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
        <ChevronDown className={`${styles.TimeSelect__OpenIcon} ${isOpen ? styles.TimeSelect__OpenIcon_Open : ""}`} />
      </button>
      {isOpen && dropdownPosition && (
        <div className={styles.TimeSelect__Dropdown} ref={dropdownRef}>
          <ul className={styles.TimeSelect__List}>
            {options.map(option => {
              return (
                <li key={option}>
                  <button
                    type='button'
                    className={`${styles.TimeSelect__Option} ${timeValues[key] === option ? styles.TimeSelect__Option_selected : ""}`}
                    data-test-id={"select-option-" + name}
                    onClick={() => {
                      const triggeredValues: ("time.start" | "time.end" | "time.duration")[] = [];
                      if (timeValues.duration) {
                        triggeredValues.push("time.duration");
                      }
                      if (timeValues.start) {
                        triggeredValues.push("time.start");
                      }
                      if (timeValues.end) {
                        triggeredValues.push("time.end");
                      }
                      setValue(name, option, {
                        shouldValidate: true,
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                      setIsOpen(false);
                      if (option.trim() !== "-") {
                        setShowSuccess(true);
                      } else {
                        setShowSuccess(false);
                      }
                      trigger(triggeredValues);
                    }}
                  >
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
