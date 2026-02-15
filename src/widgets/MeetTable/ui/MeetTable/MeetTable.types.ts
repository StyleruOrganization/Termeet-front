import type { IMeetingInfo } from "@/entities/Meet/model/Meet.types";

export type MeetTableProps = Pick<IMeetingInfo["meeting"], "meeting_days" | "start_time" | "end_time">;
