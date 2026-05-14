import { useRef, useState } from "react";
import { useDropdownPosition } from "./lib/hooks/useDropdownPosition";
import styles from "./Select.module.css";
import { Input } from "../Input/Input";
import type { TimeSelectProps } from "./Select.types";

export const Select = ({
  label,
  placeholder,
  options,
  name,
  className,
  disabledFunc,
  onBlur: onBLurExternal,
  onChange: onChangeExternal,
  onFocus: onFocusExternal,
  initialValue,
  value: valueProp,
  sizeArrow,
}: TimeSelectProps) => {
  const isControlled = valueProp !== undefined;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(initialValue);
  const inputValue = isControlled ? valueProp : internalValue;
  const { isOpen, dropdownPosition, openDropdown, closeDropdown } = useDropdownPosition(
    inputRef,
    dropdownRef,
    name,
    onBLurExternal,
  );

  return (
    <div
      className={styles.Select + " " + className}
      style={
        {
          "--arrow-size": (sizeArrow ?? 16) + "px",
        } as React.CSSProperties
      }
    >
      <Input
        ref={inputRef}
        value={inputValue}
        name={name}
        onClick={() => {
          if (!isOpen) {
            openDropdown();
          } else {
            closeDropdown();
          }
        }}
        onFocus={() => {
          onFocusExternal?.();
        }}
        label={label}
        placeholder={placeholder}
        readOnly
        classNameInputWrapper={styles.Select__InputWrapper + (isOpen ? " " + styles.Select__InputWrapper_open : "")}
      />
      <div
        style={{
          top: `${dropdownPosition?.top}px`,
          left: `${dropdownPosition?.left}px`,
          minWidth: `${dropdownPosition?.width}px`,
          visibility: isOpen ? "visible" : "hidden",
        }}
        className={styles.Select__Dropdown}
        ref={dropdownRef}
      >
        <ul className={styles.Select__List}>
          {options.map(option => {
            if (disabledFunc && disabledFunc(option)) return null;
            return (
              <li key={option}>
                <button
                  className={`${styles.Select__Option} ${inputValue === option ? styles.TimeSelect__Option_selected : ""}`}
                  data-test-id={"select-option-" + name}
                  onClick={event => {
                    event.preventDefault();
                    onChangeExternal?.(option);
                    if (!isControlled) {
                      setInternalValue(option);
                    }
                    closeDropdown();
                  }}
                  key={option}
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
