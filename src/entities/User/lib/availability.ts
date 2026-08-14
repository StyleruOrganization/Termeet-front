import { generateTimeOptions } from "@/shared/libs";
import type { IAvailabilityInterval } from "../model/User.types";

export const WEEKDAY_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

export const TEMPLATE_TIMES = generateTimeOptions("00:00", "23:30", 30).map(([hours, minutes]) => {
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
});

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const fromMinutes = (value: number) => {
  if (value >= 24 * 60) {
    return "24:00";
  }
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

export const isoWeekdayFromDate = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const utcDay = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return utcDay === 0 ? 7 : utcDay;
};

export const expandInterval = (start: string, end: string) => {
  const startMinutes = toMinutes(start);
  const endMinutes = end === "24:00" ? 24 * 60 : toMinutes(end);
  return TEMPLATE_TIMES.filter(time => {
    const minutes = toMinutes(time);
    return minutes >= startMinutes && minutes < endMinutes;
  });
};

export const cellInIntervals = (time: string, intervals: IAvailabilityInterval[]) => {
  const minutes = toMinutes(time);
  return intervals.some(interval => {
    const endMinutes = interval.end === "24:00" ? 24 * 60 : toMinutes(interval.end);
    return minutes >= toMinutes(interval.start) && minutes < endMinutes;
  });
};

export const intervalsForWeekday = (template: IAvailabilityInterval[], weekday: number) => {
  return template.filter(interval => !interval.weekday || interval.weekday === weekday);
};

export const mergeTimesToIntervals = (times: string[], weekday: number): IAvailabilityInterval[] => {
  const sorted = [...new Set(times)].sort((a, b) => toMinutes(a) - toMinutes(b));
  if (!sorted.length) {
    return [];
  }

  const result: IAvailabilityInterval[] = [];
  let segmentStart = sorted[0];
  let previous = sorted[0];

  const pushSegment = (start: string, last: string) => {
    result.push({
      weekday,
      start,
      end: fromMinutes(toMinutes(last) + 30),
    });
  };

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index];
    if (toMinutes(current) - toMinutes(previous) === 30) {
      previous = current;
      continue;
    }
    pushSegment(segmentStart, previous);
    segmentStart = current;
    previous = current;
  }
  pushSegment(segmentStart, previous);
  return result;
};

export const intervalsToWeekMap = (intervals: IAvailabilityInterval[]) => {
  const result = new Map<number, string[]>();
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const times = new Set<string>();
    intervalsForWeekday(intervals, weekday).forEach(interval => {
      expandInterval(interval.start, interval.end).forEach(time => times.add(time));
    });
    result.set(weekday, [...times].sort());
  }
  return result;
};

export const weekMapToIntervals = (week: Map<number, string[]>) => {
  const result: IAvailabilityInterval[] = [];
  for (let weekday = 1; weekday <= 7; weekday += 1) {
    result.push(...mergeTimesToIntervals(week.get(weekday) ?? [], weekday));
  }
  return result;
};

export const fillWeekWithInterval = (start: string, end: string): IAvailabilityInterval[] => {
  return [1, 2, 3, 4, 5, 6, 7].map(weekday => ({ weekday, start, end }));
};

const formatDaySpan = (days: number[]) => {
  const labels = days.map(day => WEEKDAY_SHORT[day - 1]);
  if (days.length === 7) {
    return "Все дни";
  }
  if (days.length === 1) {
    return labels[0];
  }
  const consecutive = days.every((day, index) => index === 0 || day === days[index - 1] + 1);
  if (consecutive) {
    return `${labels[0]}–${labels[labels.length - 1]}`;
  }
  return labels.join(", ");
};

export const formatAvailabilitySummary = (intervals: IAvailabilityInterval[]) => {
  const week = intervalsToWeekMap(intervals);
  const groups = new Map<string, number[]>();

  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const signature = (week.get(weekday) ?? []).join(",");
    if (!signature) {
      continue;
    }
    const days = groups.get(signature) ?? [];
    days.push(weekday);
    groups.set(signature, days);
  }

  return [...groups.entries()]
    .map(([signature, days]) => {
      const ranges = mergeTimesToIntervals(signature.split(","), days[0])
        .map(interval => `${interval.start}–${interval.end}`)
        .join(", ");
      return `${formatDaySpan(days)} ${ranges}`;
    })
    .join("; ");
};

export const hasAvailability = (intervals: IAvailabilityInterval[]) => {
  return weekMapToIntervals(intervalsToWeekMap(intervals)).length > 0;
};
