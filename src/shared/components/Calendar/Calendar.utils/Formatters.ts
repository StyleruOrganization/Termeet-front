import { MONTHS, SHORT_DAYS } from "@shared/consts/dateTimes";

type Formatter = (date: Date) => string;

export const formatMonthYearHeading: Formatter = date => {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const formatWeekday: Formatter = date => {
  return SHORT_DAYS[date.getDay() - 1 < 0 ? 6 : date.getDay() - 1];
};
