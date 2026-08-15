import { useRef } from "react";
import { Calendar as ReactCalendar } from "react-calendar";
import { createPortal } from "react-dom";
import Arrrow from "@assets/icons/arrow.svg";
import styles from "./DatePicker.module.css";
import { startOfToday } from "../../libs";
import { Input } from "../Input/Input";
import {
  formatMonthYearHeading,
  formatPickedDate,
  formatWeekday,
  isSameDay,
  parseDayKey,
  toDayKey,
} from "./lib/formatters";
import { useDropdownPosition } from "../Select/hooks/useDropdownPosition";
import type { DatePickerProps } from "./DatePicker.types";

export const DatePicker = ({
  name,
  value,
  onChange,
  label,
  placeholder,
  min,
  max,
  error,
  disabled,
  className,
  allowEmpty = false,
  onBlur,
}: DatePickerProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isOpen, dropdownPosition, openDropdown, closeDropdown } = useDropdownPosition(
    inputRef,
    dropdownRef,
    name,
    onBlur,
    "bottom",
    false,
  );

  const selected = value ? parseDayKey(value) : null;
  const minDate = min ? parseDayKey(min) : undefined;
  const maxDate = max ? parseDayKey(max) : undefined;
  const today = startOfToday();
  const displayValue = selected ? formatPickedDate(selected) : "";

  const dayClassName = (date: Date) => {
    const classes = [styles.DatePicker__Day];
    if (isSameDay(date, today)) {
      classes.push(styles.DatePicker__Day__Today);
    }
    if (selected && isSameDay(date, selected)) {
      classes.push(styles.DatePicker__Day_Selected);
    }
    return classes.join(" ");
  };

  return (
    <div
      className={`${styles.DatePicker} ${className ?? ""}`}
      style={{ "--arrow-size": "16px" } as React.CSSProperties}
    >
      <Input
        ref={inputRef}
        name={name}
        label={label}
        placeholder={placeholder}
        value={displayValue}
        error={error}
        disabled={disabled}
        readOnly
        onClick={() => {
          if (disabled) {
            return;
          }
          if (!isOpen) {
            openDropdown();
          } else {
            closeDropdown();
          }
        }}
        classNameInputWrapper={
          styles.DatePicker__InputWrapper + (isOpen ? " " + styles.DatePicker__InputWrapper_open : "")
        }
      />
      {createPortal(
        <div
          ref={dropdownRef}
          className={`${styles.DatePicker__Popover} ${isOpen ? styles.DatePicker__Popover_open : ""}`}
          aria-hidden={!isOpen}
          style={{
            top: `${dropdownPosition?.top}px`,
            left: `${dropdownPosition?.left}px`,
            visibility: isOpen ? "visible" : "hidden",
            pointerEvents: isOpen ? "auto" : "none",
          }}
        >
          <ReactCalendar
            className={styles.DatePicker__Calendar}
            data-test-id={`${name}-calendar`}
            locale='ru-RU'
            minDetail='month'
            nextAriaLabel='Go to next'
            prevAriaLabel='Go to prev'
            minDate={minDate ?? undefined}
            maxDate={maxDate ?? undefined}
            value={selected ?? undefined}
            next2Label={null}
            prev2Label={null}
            nextLabel={<Arrrow className={styles.DatePicker__Arrow} />}
            prevLabel={<Arrrow className={styles.DatePicker__Arrow_Left} />}
            formatMonthYear={(_, date) => formatMonthYearHeading(date)}
            formatShortWeekday={formatWeekday}
            tileDisabled={({ date }) => {
              const day = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
              if (minDate && day < minDate.getTime()) {
                return true;
              }
              if (maxDate && day > maxDate.getTime()) {
                return true;
              }
              return false;
            }}
            onClickDay={(date, event) => {
              event.preventDefault();
              const next = toDayKey(date);
              if (allowEmpty && value === next) {
                onChange("");
              } else {
                onChange(next);
              }
              closeDropdown();
            }}
            tileClassName={() => styles.DatePicker__Day_Wrapper}
            tileContent={({ date }) => <div className={dayClassName(date)}>{date.getDate()}</div>}
          />
        </div>,
        document.body,
      )}
    </div>
  );
};
