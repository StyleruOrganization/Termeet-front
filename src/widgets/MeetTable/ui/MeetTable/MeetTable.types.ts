import type { IMeetInfo } from "@/entities/Meet/model/Meet.types";

export type MeetTableProps = Pick<IMeetInfo["meeting"], "meeting_days" | "start_time" | "end_time">;
