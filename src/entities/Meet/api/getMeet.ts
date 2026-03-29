import { apiClient } from "@/shared/api";
import { meetResponseSchema, type MeetResponse } from "../model/Meet.schema";

export const getMeet = async (hash?: string) => {
  const data = await apiClient.get<MeetResponse>(`/meet/${hash}`, {}, meetResponseSchema);
  return data;
};
