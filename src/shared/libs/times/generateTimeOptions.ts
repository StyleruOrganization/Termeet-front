/**
 * Генерирует массив временных интервалов между from (включительно) и to (включительно)
 * @param from - начальное время в формате "HH:MM" или "HH:MM:SS" (включается)
 * @param to - конечное время в формате "HH:MM" или "HH:MM:SS" (включается)
 * @param intervalMinutes - интервал в минутах (по умолчанию 30)
 * @returns массив [часы, минуты] для каждого интервала
 */
export function generateTimeOptions(from: string, to: string, intervalMinutes: number = 30) {
  const [startHour, startMinutes] = from.split(":").map(Number);
  const [endHour, endMinutes] = to.split(":").map(Number);
  const startTime = startHour * 60 + startMinutes;
  let endTime = endHour * 60 + endMinutes;
  const result = [];

  // Если конечное время меньше начального - значит переход через полночь
  if (endTime < startTime) {
    endTime += 24 * 60;
  }

  // Используем <= для включения конечного времени
  for (let currentTime = startTime; currentTime <= endTime; currentTime += intervalMinutes) {
    const hours = Math.floor(currentTime / 60);
    const minutes = currentTime % 60;

    // Для перехода через полночь, если часы >= 24, вычитаем 24 для корректного отображения
    if (hours >= 24) {
      result.push([hours - 24, minutes]);
    } else {
      result.push([hours, minutes]);
    }
  }

  return result;
}
