/**
 * Сравнивает две строки времени в формате HH:MM
 * @param time1 - первое время (например, "10:30")
 * @param time2 - второе время (например, "14:15")
 * @returns true если time1 < time2, иначе false
 */
export const isTimeBefore = (time1: string, time2: string): boolean => {
  const [hours1, minutes1] = time1.split(":").map(Number);
  const [hours2, minutes2] = time2.split(":").map(Number);

  if (hours1 < hours2) return true;
  if (hours1 > hours2) return false;
  return minutes1 < minutes2;
};
