import { useRef } from "react";
import { Input } from "@shared/ui";
import styles from "./Select.module.css";
import { useDropdownPosition } from "../../lib/hooks/useDropdownPosition";
import { useCreateMeetStore } from "../../model";
import type { TimeSelectProps } from "./Select.types";

export const Select = ({ label, placeholder, options, name, className, disabledFunc }: TimeSelectProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, dropdownPosition, openDropdown, closeDropdown } = useDropdownPosition(inputRef, dropdownRef, name);
  const inputValue = useCreateMeetStore(state => state.values[name]);
  const setTime = useCreateMeetStore(state => state.setTime);

  return (
    <div className={styles.TimeSelect + " " + className}>
      <Input
        ref={inputRef}
        value={inputValue}
        name={name}
        onClick={() => {
          openDropdown();
        }}
        onFocus={() => {
          if (name == "timeDuration") {
            setTime("timeDuration", " час", false);
          }
          setTime(name, "", false);
        }}
        label={label}
        placeholder={placeholder}
        readOnly
        className={styles.TimeSelect__InputWrapper + (isOpen ? " " + styles.TimeSelect__InputWrapper_open : "")}
      />
      <div
        style={{
          top: `${dropdownPosition?.top}px`,
          left: `${dropdownPosition?.left}px`,
          width: `${dropdownPosition?.width}px`,
          visibility: isOpen ? "visible" : "hidden",
        }}
        className={styles.TimeSelect__Dropdown}
        ref={dropdownRef}
      >
        <ul className={styles.TimeSelect__List}>
          {options.map(option => {
            if (disabledFunc(option)) return null;
            return (
              <li key={option}>
                <button
                  className={`${styles.TimeSelect__Option} ${inputValue === option ? styles.TimeSelect__Option_selected : ""}`}
                  data-test-id={"select-option-" + name}
                  onClick={event => {
                    event.preventDefault();
                    setTime(name, option);
                    closeDropdown();
                  }}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
