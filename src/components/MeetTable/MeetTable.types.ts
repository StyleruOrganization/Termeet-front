import type { IMeetingInfo } from "@/shared/types/Meet.types";

export type MeetTableProps = Pick<IMeetingInfo["meeting"], "meeting_days" | "start_time" | "end_time">;
