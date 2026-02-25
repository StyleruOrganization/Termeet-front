import { generateTimeOptions } from "./generateTimeOptions";

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
