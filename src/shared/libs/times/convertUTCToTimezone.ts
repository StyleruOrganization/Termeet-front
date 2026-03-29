/**
 * Преобразуем UTC в разные часовые пояса
 * @param utcString - время в формате UTC 2026-03-19T12:00:00Z
 * @param offsetHours - разница во времени
 */
export const convertUTCToTimezone = (utcString: string, offsetHours: number): string => {
  const date = new Date(utcString);
  const utcTime = date.getTime();
  const offsetMs = offsetHours * 60 * 60 * 1000;
  const localTime = new Date(utcTime + offsetMs);

  const year = localTime.getUTCFullYear();
  const month = String(localTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(localTime.getUTCDate()).padStart(2, "0");
  const hours = String(localTime.getUTCHours()).padStart(2, "0");
  const minutes = String(localTime.getUTCMinutes()).padStart(2, "0");
  const seconds = String(localTime.getUTCSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};
