import { MONTHS, MONTHS_GENITIVE, SHORT_DAYS } from "../../../consts";

export const toDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseDayKey = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

export const formatPickedDate = (date: Date) => {
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatMonthYearHeading = (date: Date) => {
  const month = MONTHS[date.getMonth()];
  return `${month[0].toUpperCase() + month.slice(1)} ${date.getFullYear()}`;
};

export const formatWeekday = (_locale: string | undefined, date: Date) => {
  return SHORT_DAYS[date.getDay() - 1 < 0 ? 6 : date.getDay() - 1];
};

export const isSameDay = (left: Date, right: Date) => {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
};
