import { mockMeetingInfo, mockMeetingInfoWithUserSlots } from "../mocks/MeetingInfo";
import type { IMeetInfo } from "@/entities/Meet";

export const useMeetingInfo = ({ withSlots }: { withSlots: boolean }): IMeetInfo => {
  return withSlots ? mockMeetingInfoWithUserSlots : mockMeetingInfo;
};
