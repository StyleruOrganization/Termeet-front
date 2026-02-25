export const getLocalTime = (date: string) => {
  const localDate = new Date(date);

  return `${localDate.getFullYear().toString()}-${(localDate.getMonth() + 1).toString().padStart(2, "0")}-${localDate.getDate().toString().padStart(2, "0")}T${localDate.getHours().toString().padStart(2, "0")}:${localDate.getMinutes().toString().padStart(2, "0")}:${localDate.getSeconds().toString().padStart(2, "0")}`;
};
