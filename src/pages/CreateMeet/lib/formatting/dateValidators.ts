import { isDateBeforeToday, startOfToday } from "@/shared/libs";

export const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const parseStrictDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

export const lastMeetingDay = (dates: { start: Date; end: Date }[]): Date | null => {
  if (!dates.length) {
    return null;
  }
  return dates.reduce(
    (latest, interval) => {
      const start = new Date(interval.start.getFullYear(), interval.start.getMonth(), interval.start.getDate());
      const end = new Date(interval.end.getFullYear(), interval.end.getMonth(), interval.end.getDate());
      const localMax = start > end ? start : end;
      return localMax > latest ? localMax : latest;
    },
    new Date(dates[0].start.getFullYear(), dates[0].start.getMonth(), dates[0].start.getDate()),
  );
};

export const maxVoteDeadlineDay = (dates: { start: Date; end: Date }[], now = new Date()) => {
  const today = startOfToday(now);
  const last = lastMeetingDay(dates);
  if (last && last.getTime() >= today.getTime()) {
    return last;
  }
  return new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
};

export const voteDeadlineError = (
  dateValue: string,
  timeValue: string,
  dates: { start: Date; end: Date }[],
  now = new Date(),
): string | undefined => {
  if (!dateValue.trim()) {
    return undefined;
  }
  const day = parseStrictDate(dateValue);
  if (!day) {
    return "Такой даты нет — проверьте день и месяц";
  }
  if (isDateBeforeToday(day, now)) {
    return "Нельзя выбрать прошедшую дату";
  }
  const maxDay = maxVoteDeadlineDay(dates, now);
  if (day.getTime() > maxDay.getTime()) {
    return dates.length
      ? "Дедлайн не может быть позже последнего дня встречи"
      : "Дедлайн слишком далеко — выберите дату в пределах года";
  }
  const clock = (timeValue || "18 : 00").replace(/\s/g, "");
  const parsed = new Date(`${dateValue}T${clock}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return "Проверьте дату и время";
  }
  if (parsed.getTime() <= now.getTime()) {
    return "Это время уже прошло";
  }
  return undefined;
};
