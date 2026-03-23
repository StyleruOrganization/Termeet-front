import { generateTimeOptions } from "./generateTimeOptions";

export const TIMES = generateTimeOptions("00:00", "23:30").map(
  ([hours, minutes]) => `${hours.toString(10).padStart(2, "0")} : ${minutes.toString(10).padStart(2, "0")}`,
);
export const DURATIONS = ["1 час", "1,5 часа", "2 часа", "2,5 часа", "3 часа"];
