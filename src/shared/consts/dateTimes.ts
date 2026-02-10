import { generateTimeOptions } from "./../utils/timeFormatters";

export const TIMES = generateTimeOptions("00:00", "23:30").map(
  ([hours, minutes]) => `${hours.toString(10).padStart(2, "0")} : ${minutes.toString(10).padStart(2, "0")}`,
);
export const DURATIONS = generateDurationOptions();

function generateDurationOptions() {
  return generateTimeOptions("00:00", "05:00", 15)
    .slice(1)
    .map(([hours, minutes]) => {
      return `${hours ? hours + " ч " : ""}${minutes ? minutes + " мин" : ""}`;
    });
}

export const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

export const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export const SHORT_DAYS = ["п", "в", "с", "ч", "п", "с", "в"];
