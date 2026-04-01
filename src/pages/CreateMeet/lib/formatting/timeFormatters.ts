import { timeToMinutes } from "@shared/libs";

/**
 * Форматирует ввод времени, автоматически добавляя двоеточие
 * @param value - текущее значение инпута
 * @returns отформатированное значение
 */
export const formatTime = (value: string): { isValid: boolean; value: string } => {
  // Удаляем все нецифровые символы
  const numbers = value.replace(/\D/g, "");

  if (numbers.length === 0) {
    return { isValid: false, value: "" };
  }

  let formatted = "";
  let isValid = false;

  // Форматируем
  if (numbers.length <= 2) {
    formatted = numbers;
  } else {
    const hours = numbers.slice(0, 2);
    const minutes = numbers.slice(2, 4);
    formatted = `${hours} : ${minutes}`;
  }

  // Проверяем валидность: должно быть 4 цифры, часы 00-23, минуты 00-59
  if (numbers.length >= 4) {
    const hours = parseInt(numbers.slice(0, 2));
    const minutes = parseInt(numbers.slice(2, 4));

    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      isValid = true;
    }
  }

  return { isValid, value: formatted };
};

/**
 * Проверяет, что продолжительность не превышает разницу между timeStart и timeEnd
 * @param duration - продолжительность из списка DURATIONS
 * @param timeStart - время начала в формате HH:MM
 * @param timeEnd - время окончания в формате HH:MM
 * @returns true если продолжительность <= разнице между start и end
 */
export const isDurationValid = (duration: string, timeStart: string, timeEnd: string): boolean => {
  const startMinutes = timeToMinutes(timeStart);
  const endMinutes = timeToMinutes(timeEnd);
  const durationMinutes = durationToMinutes(duration);

  const availableMinutes = endMinutes - startMinutes;

  return durationMinutes <= availableMinutes;
};

const durationToMinutes = (duration: string): number => {
  const normalized = duration.trim().toLowerCase();

  if (normalized.includes("мин")) {
    const value = parseFloat(normalized.replace("мин", "").trim());
    return value;
  }

  if (normalized.includes("час")) {
    const value = parseFloat(normalized.replace("часа", "").replace("час", "").trim().replace(",", "."));
    return value * 60;
  }

  return 0;
};
