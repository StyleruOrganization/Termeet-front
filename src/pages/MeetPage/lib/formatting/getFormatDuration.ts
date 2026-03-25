export const getFormattedDuration = (duration: string) => {
  if (!duration) return "";
  const [hours, minutes] = duration.split(":").map(Number);
  return `${hours}${minutes ? ".5" : ""} час${minutes ? "а" : ""}`;
};
