import { mockMeetingInfo, mockMeetingInfoWithUserSlots } from "../mocks/MeetingInfo";
import type { IMeetingInfo } from "@shared/types/Meet.types";

export const useMeetingInfo = ({ withSlots }: { withSlots: boolean }): IMeetingInfo => {
  return withSlots ? mockMeetingInfoWithUserSlots : mockMeetingInfo;
};
