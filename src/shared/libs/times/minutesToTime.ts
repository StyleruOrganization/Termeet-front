export const minutesToTime = (total: number): string => {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};
