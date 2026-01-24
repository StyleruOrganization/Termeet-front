import { MONTHS, SHORT_DAYS } from "@shared/consts/dateTimes";

type Formatter = (date: Date) => string;

export const formatMonthYearHeading: Formatter = date => {
  const month = MONTHS[date.getMonth()];

  return `${month[0][0].toUpperCase() + month.slice(1)} ${date.getFullYear()}`;
};

export const formatWeekday: Formatter = date => {
  return SHORT_DAYS[date.getDay() - 1 < 0 ? 6 : date.getDay() - 1];
};
