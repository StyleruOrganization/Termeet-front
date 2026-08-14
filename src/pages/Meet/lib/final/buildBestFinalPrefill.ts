import { maxFinalCells, minutesToTime, timeToMinutes } from "@/shared/libs";
import type { IMeet } from "@/entities/Meet";

type Candidate = {
  day: string;
  times: string[];
  minPeople: number;
  sumPeople: number;
};

const isBetterWindow = (best: Candidate | null, candidate: Candidate, targetCells: number) => {
  if (!best) {
    return true;
  }
  const bestFull = best.times.length === targetCells;
  const candidateFull = candidate.times.length === targetCells;
  if (candidateFull !== bestFull) {
    return candidateFull;
  }
  if (candidate.minPeople !== best.minPeople) {
    return candidate.minPeople > best.minPeople;
  }
  if (candidate.times.length !== best.times.length) {
    return candidate.times.length > best.times.length;
  }
  if (candidate.sumPeople !== best.sumPeople) {
    return candidate.sumPeople > best.sumPeople;
  }
  if (candidate.day !== best.day) {
    return candidate.day < best.day;
  }
  return candidate.times[0] < best.times[0];
};

const buildPeakPrefill = (timeInfo: IMeet["timeInfo"]) => {
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

/**
 * Лучшее пересечение под итог. Если у встречи задана продолжительность —
 * берём непрерывное окно не длиннее неё, лучше ровно этой длины.
 */
export const buildBestFinalPrefill = (timeInfo: IMeet["timeInfo"], duration?: string | null) => {
  const targetCells = maxFinalCells(duration);
  if (!targetCells) {
    return buildPeakPrefill(timeInfo);
  }

  let best: Candidate | null = null;
  const days = Array.from(timeInfo.keys()).sort((a, b) => a.localeCompare(b));

  for (const date of days) {
    const inner = timeInfo.get(date);
    if (!inner) {
      continue;
    }
    const votedTimes = Array.from(inner.userSlots.entries())
      .filter(([, users]) => users.length > 0)
      .map(([time]) => time)
      .sort();
    const votedSet = new Set(votedTimes);

    for (const start of votedTimes) {
      const window: string[] = [start];
      let current = start;
      while (window.length < targetCells) {
        const nextTime = minutesToTime(timeToMinutes(current) + 30);
        if (!votedSet.has(nextTime)) {
          break;
        }
        window.push(nextTime);
        current = nextTime;
      }
      const counts = window.map(time => inner.userSlots.get(time)?.length ?? 0);
      const candidate: Candidate = {
        day: date,
        times: window,
        minPeople: Math.min(...counts),
        sumPeople: counts.reduce((sum, count) => sum + count, 0),
      };
      if (isBetterWindow(best, candidate, targetCells)) {
        best = candidate;
      }
    }
  }

  const next = new Map<string, string[]>();
  if (best) {
    next.set(best.day, best.times);
  }
  return { prefill: next, people: best?.minPeople ?? 0, day: best?.day ?? "" };
};
