import type { IMeet } from "@/entities/Meet";

export type MeetTableProps = Pick<IMeet, "meeting_days" | "timeRanges" | "mySlotName"> & {
  canVote: boolean;
  canObserve: boolean;
  canSetFinal: boolean;
  hasFinal: boolean;
};
