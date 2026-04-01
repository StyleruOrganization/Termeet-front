import { timeToMinutes } from "./timeToMinutes";

export const isMoreOrEqThan30Min = (time1: string, time2: string): boolean => {
  if (!time1 || !time2) return false;
  const minutes1 = timeToMinutes(time1);
  const minutes2 = timeToMinutes(time2);

  return Math.abs(minutes2 - minutes1) >= 30;
};
