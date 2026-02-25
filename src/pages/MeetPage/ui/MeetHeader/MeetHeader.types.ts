import type { IMeet } from "@/entities/Meet";

export type MeetHeaderProps = Pick<IMeet, "description" | "duration" | "name">;
