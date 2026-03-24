import { useRef } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronDown } from "@assets/icons";
import { InputForm } from "@features/InputForm";
import styles from "./Select.module.css";
import { useDropdownPosition } from "../../lib/hooks/useDropdownPosition";
import type { TimeSelectProps } from "./Select.types";
import type { ICreateMeet } from "../../model";

export const Select = ({
  label,
  placeholder,
  options,
  name,
  error,
  formatValue,
  readonly = false,
}: TimeSelectProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const { setValue, watch, trigger } = useFormContext<ICreateMeet>();
  const { isOpen, dropdownPosition, openDropdown, closeDropdown } = useDropdownPosition(inputRef, dropdownRef);

  const timeValues = watch("time");
  console.log("fieldValue in Select", timeValues);
  console.log("name in Select", name);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatValue(event.target.value as string);

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
    <div className={styles.TimeSelect} ref={inputRef}>
      <InputForm
        name={name}
        onChange={handleChange}
        onClick={() => {
          console.log("click in input");
          openDropdown();
        }}
        label={label}
        placeholder={placeholder}
        readOnly={readonly}
        error={error}
      />
      <div className={styles.TimeSelect__Toggle}>
        <ChevronDown className={`${styles.TimeSelect__OpenIcon} ${isOpen ? styles.TimeSelect__OpenIcon_Open : ""}`} />
      </div>
      {isOpen && dropdownPosition && (
        <div
          style={{
            top: `${dropdownPosition}px`,
          }}
          className={styles.TimeSelect__Dropdown}
          ref={dropdownRef}
        >
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
                      closeDropdown();
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
