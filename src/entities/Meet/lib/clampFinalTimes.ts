import { maxFinalCells, minutesToTime, timeToMinutes } from "@/shared/libs";

/**
 * Итог с продолжительностью — один непрерывный кусок не длиннее duration.
 * Новая ячейка задаёт, какой кусок оставить: соседние расширяют, далёкая начинает заново.
 */
export const clampFinalTimes = (times: string[], added: string, duration?: string | null): string[] => {
  const unique = [...new Set(times)].sort();
  const maxCells = maxFinalCells(duration);
  if (!maxCells) {
    return unique;
  }

  const existing = new Set(unique);
  const addedMinutes = timeToMinutes(added);
  if (!Number.isFinite(addedMinutes)) {
    return unique.slice(0, maxCells);
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

  if (cells.length <= maxCells) {
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
