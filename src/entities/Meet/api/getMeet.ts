import { apiClient } from "@/shared/api";
import type { MeetResponse } from "../model/Meet.schema";

export const getMeet = async (hash?: string) => {
  console.log("[getMeet] request", hash);
  try {
    const data = await apiClient.get<MeetResponse>(`/meet/${hash}`);
    console.log("[getMeet] ok", {
      hash,
      keys: data && typeof data === "object" ? Object.keys(data) : typeof data,
      dataRange: data?.dataRange ?? data?.data_range,
      duration: data?.duration,
      slots: data?.slots,
      finalSlot: data?.finalSlot,
    });
    return data;
  } catch (error) {
    console.error("[getMeet] fail", hash, error);
    throw error;
  }
};
