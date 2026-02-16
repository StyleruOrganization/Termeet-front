import { generateTimeOptions } from "@/shared/libs";
import type { MeetTableProps } from "../../ui/MeetTable/MeetTable.types";

export const getCellIds = ({ start_time, end_time, meeting_days }: MeetTableProps): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  const times = generateTimeOptions(start_time.slice(0, 5), end_time.slice(0, 5));

  for (const day of meeting_days) {
    result[day] = [];

    for (const time of times) {
      result[day].push(`${day}T${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}:00Z`);
    }
  }

  return result;
};
