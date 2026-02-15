import { mockMeetingInfo, mockMeetingInfoWithUserSlots } from "../mocks/MeetingInfo";
import type { IMeetingInfo } from "@/entities/Meet/model/Meet.types";

export const useMeetingInfo = ({ withSlots }: { withSlots: boolean }): IMeetingInfo => {
  return withSlots ? mockMeetingInfoWithUserSlots : mockMeetingInfo;
};
