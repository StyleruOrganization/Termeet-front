let prevValue = "";
/**
 * Форматирует ввод времени, автоматически добавляя двоеточие
 * @param value - текущее значение инпута
 * @returns отформатированное значение
 */
export const formatTime = (value: string): { isValid: boolean; value: string } => {
  console.log("formatTime", { value, prevValue });
  if (value.length < prevValue.length && value.trim().split(" ").length == 2) {
    return { isValid: false, value: value.trim().split(" ")[0] };
  }
  const regExpTime = /^([0-1][0-9]|2[0-3]) : [0-5][0-9]$/;
  const result: { isValid: boolean; value: string } = {
    isValid: false,
    value: "",
  };
  const numbers = value.replace(/\D/g, "");

  if (regExpTime.test(numbers) || value.length > 4) {
    result.isValid = true;
  }

  if (numbers.length <= 2) {
    result.value = numbers;
  } else {
    result.value = `${numbers.slice(0, 2)} : ${numbers.slice(2, 4)}`;
  }

  prevValue = value;

  return result;
};
