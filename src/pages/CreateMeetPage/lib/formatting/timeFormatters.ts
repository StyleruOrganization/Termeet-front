/**
 * Форматирует ввод времени, автоматически добавляя двоеточие
 * @param value - текущее значение инпута
 * @returns отформатированное значение
 */
export const formatTime = (value: string): { isValid: boolean; value: string } => {
  const regExpTime = /^([0-1][0-9]|2[0-3])[0-5][0-9]$/;
  const result: { isValid: boolean; value: string } = {
    isValid: false,
    value: "",
  };
  const numbers = value.replace(/\D/g, "");

  if (regExpTime.test(numbers)) {
    result.isValid = true;
  }

  if (numbers.length <= 2) {
    result.value = numbers;
  }

  if (numbers.length <= 4) {
    result.value = `${numbers.slice(0, 2)} : ${numbers.slice(2)}`;
  }

  return result;
};
