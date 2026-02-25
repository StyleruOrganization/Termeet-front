// time2 - time1 > 30 minutes
export const isMoreThan30Min = (time1: string, time2: string): boolean => {
  if (!time1 || !time2) return false;
  const [h1, m1, s1] = time1.split(":").map(Number);
  const [h2, m2, s2] = time2.split(":").map(Number);

  const minutes1 = h1 * 60 + m1 + s1 / 60;
  const minutes2 = h2 * 60 + m2 + s2 / 60;

  return Math.abs(minutes2 - minutes1) > 30;
};
