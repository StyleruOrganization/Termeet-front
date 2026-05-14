import { apiClient } from "@/shared/api";
import type { MeetResponse } from "../model/Meet.schema";

export const getMeet = async (hash?: string) => {
  const data = await apiClient.get<MeetResponse>(`/meet/${hash}`);
  return data;
};
