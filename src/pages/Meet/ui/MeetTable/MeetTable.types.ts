import type { IMeet } from "@/entities/Meet";

export type MeetTableProps = Pick<IMeet, "meeting_days" | "timeRanges">;
