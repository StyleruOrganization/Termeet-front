export const getFormattedDuration = (duration: string) => {
  if (!duration) return "";
  const [hours, minutes] = duration.split(":");
  const formattedDuration =
    (hours === "00" ? "" : (hours.startsWith("0") ? hours[1] : hours) + " ч") +
    " " +
    (minutes === "00" ? "" : (minutes.startsWith("0") ? minutes[1] : minutes) + " мин");

  return formattedDuration;
};
