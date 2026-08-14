import type { IMeet } from "@/entities/Meet";

export const buildBestFinalPrefill = (timeInfo: IMeet["timeInfo"]) => {
  let bestDay = "";
  let bestTimes: string[] = [];
  let bestScore = 0;
  let bestCount = 0;

  const days = Array.from(timeInfo.keys()).sort((a, b) => a.localeCompare(b));

  days.forEach(date => {
    const inner = timeInfo.get(date);
    if (!inner) {
      return;
    }
    let dayMax = 0;
    inner.userSlots.forEach(users => {
      if (users.length > dayMax) {
        dayMax = users.length;
      }
    });
    if (dayMax === 0) {
      return;
    }
    const times: string[] = [];
    inner.userSlots.forEach((users, time) => {
      if (users.length === dayMax) {
        times.push(time);
      }
    });
    const betterPeak = dayMax > bestScore;
    const samePeakMoreCells = dayMax === bestScore && times.length > bestCount;
    if (betterPeak || samePeakMoreCells) {
      bestScore = dayMax;
      bestCount = times.length;
      bestDay = date;
      bestTimes = times.sort();
    }
  });

  const next = new Map<string, string[]>();
  if (bestDay) {
    next.set(bestDay, bestTimes);
  }
  return { prefill: next, people: bestScore, day: bestDay };
};
