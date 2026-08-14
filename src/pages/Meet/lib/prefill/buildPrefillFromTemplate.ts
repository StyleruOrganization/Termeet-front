import { cellInIntervals, intervalsForWeekday, isoWeekdayFromDate, type IAvailabilityInterval } from "@/entities/User";
import { generateTimeOptions } from "@/shared/libs";
import type { IMeet } from "@/entities/Meet";

export const buildPrefillFromTemplate = (
  timeInfo: IMeet["timeInfo"],
  template: IAvailabilityInterval[],
): Map<string, string[]> => {
  const result = new Map<string, string[]>();
  if (!template.length) {
    return result;
  }

  timeInfo.forEach((inner, date) => {
    const weekdayIntervals = intervalsForWeekday(template, isoWeekdayFromDate(date));
    if (!weekdayIntervals.length) {
      return;
    }

    const times: string[] = [];
    inner.timeRanges.forEach(([startTime, endTime]) => {
      generateTimeOptions(startTime, endTime).forEach(([hours, minutes]) => {
        const key = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
        if (cellInIntervals(key, weekdayIntervals) && !times.includes(key)) {
          times.push(key);
        }
      });
    });
    if (times.length) {
      result.set(date, times);
    }
  });

  return result;
};
