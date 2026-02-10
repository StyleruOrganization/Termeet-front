/**
 @returns [number, number][] 
 @example generateTimeOptions("09:00:00Z", "18:00:00Z", 30)
 @default intervalMinutes=30
 */
export function generateTimeOptions(from: string, to: string, intervalMinutes: number = 30) {
  const [startHour, startMinutes] = from.split(":").map(Number);
  const [endHour, endMinutes] = to.split(":").map(Number);
  let startTime = startHour * 60 + startMinutes;
  const endTime = endHour * 60 + endMinutes;
  const result = [];

  for (; startTime <= endTime; startTime += intervalMinutes) {
    result.push([Math.floor(startTime / 60), startTime % 60]);
  }

  return result;
}
