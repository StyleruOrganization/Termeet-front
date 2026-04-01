import { generateTimeOptions } from "@/shared/libs";

export const getCellIds = ({
  startTime,
  endTime,
  date,
}: {
  startTime: string;
  endTime: string;
  date: string;
}): string[] => {
  if (!startTime || !endTime || !date) return [];
  const result: string[] = [];
  const times = generateTimeOptions(startTime, endTime);

  for (const time of times) {
    result.push(`${date}T${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}`);
  }

  return result;
};
