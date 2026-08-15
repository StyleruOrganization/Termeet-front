import { maxFinalCells, minutesToTime, timeToMinutes } from "@/shared/libs";

const contiguousGroups = (times: string[]): string[][] => {
  const unique = [...new Set(times)].sort();
  const groups: string[][] = [];
  unique.forEach(time => {
    const minutes = timeToMinutes(time);
    const last = groups[groups.length - 1];
    if (last && timeToMinutes(last[last.length - 1]) + 30 === minutes) {
      last.push(time);
      return;
    }
    groups.push([time]);
  });
  return groups;
};

/** Самый длинный непрерывный кусок. При равенстве — более ранний. */
export const longestContiguousTimes = (times: string[]): string[] => {
  const groups = contiguousGroups(times);
  if (!groups.length) {
    return [];
  }
  return groups.reduce((best, group) => (group.length > best.length ? group : best));
};

export const keepOneFinalInterval = (slots: Map<string, string[]>): Map<string, string[]> => {
  const next = new Map<string, string[]>();
  let bestDay = "";
  let bestTimes: string[] = [];
  Array.from(slots.keys())
    .sort((left, right) => left.localeCompare(right))
    .forEach(day => {
      const times = longestContiguousTimes(slots.get(day) ?? []);
      if (times.length > bestTimes.length) {
        bestDay = day;
        bestTimes = times;
      }
    });
  if (bestDay && bestTimes.length) {
    next.set(bestDay, bestTimes);
  }
  return next;
};

/**
 * Итог — один непрерывный кусок в дне.
 * Соседние ячейки расширяют его, далёкая начинает заново.
 * Если задана продолжительность — кусок не длиннее неё.
 */
export const clampFinalTimes = (times: string[], added: string, duration?: string | null): string[] => {
  const unique = [...new Set(times)].sort();
  const existing = new Set(unique);
  const addedMinutes = timeToMinutes(added);
  if (!Number.isFinite(addedMinutes)) {
    return longestContiguousTimes(unique);
  }

  let start = addedMinutes;
  let end = addedMinutes;
  while (existing.has(minutesToTime(start - 30))) {
    start -= 30;
  }
  while (existing.has(minutesToTime(end + 30))) {
    end += 30;
  }

  const cells: string[] = [];
  for (let current = start; current <= end; current += 30) {
    cells.push(minutesToTime(current));
  }

  const maxCells = maxFinalCells(duration);
  if (!maxCells || cells.length <= maxCells) {
    return cells;
  }

  if (addedMinutes === end) {
    return cells.slice(-maxCells);
  }
  if (addedMinutes === start) {
    return cells.slice(0, maxCells);
  }

  const addedIndex = cells.indexOf(added);
  const from = Math.max(0, Math.min(addedIndex, cells.length - maxCells));
  return cells.slice(from, from + maxCells);
};
