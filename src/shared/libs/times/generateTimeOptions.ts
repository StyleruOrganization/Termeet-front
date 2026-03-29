/**
 * Генерирует массив временных интервалов между from (включительно) и to (исключительно)
 * @param from - начальное время в формате "HH:MM" или "HH:MM:SS" (включается)
 * @param to - конечное время в формате "HH:MM" или "HH:MM:SS" (НЕ включается)
 * @param intervalMinutes - интервал в минутах (по умолчанию 30)
 * @returns массив [часы, минуты] для каждого интервала
 *
 * @example
 * // Интервал с 09:00 до 18:00 с шагом 30 минут
 * generateTimeOptions("09:00", "18:00", 30)
 * // Вернет: [[9,0], [9,30], [10,0], ..., [17,30]]
 *
 * @example
 * // Одинаковое время - возвращает пустой массив (начало = конец)
 * generateTimeOptions("00:00", "00:00", 30) // []
 *
 * @example
 * // Переход через полночь
 * generateTimeOptions("23:00", "01:00", 30)
 * // Вернет: [[23,0], [23,30], [0,0], [0,30]]
 */
export function generateTimeOptions(from: string, to: string, intervalMinutes: number = 30) {
  const [startHour, startMinutes] = from.split(":").map(Number);
  const [endHour, endMinutes] = to.split(":").map(Number);
  let startTime = startHour * 60 + startMinutes;
  let endTime = endHour * 60 + endMinutes;
  const result = [];

  // Если время начала и окончания совпадают - возвращаем пустой массив
  if (startTime === endTime) {
    return [];
  }

  // Если конечное время меньше начального - значит переход через полночь
  if (endTime < startTime) {
    endTime += 24 * 60;
  }

  // Используем < для исключения конечного времени
  for (; startTime < endTime; startTime += intervalMinutes) {
    const hours = Math.floor(startTime / 60);
    if (hours >= 24) break;
    result.push([hours, startTime % 60]);
  }

  return result;
}
