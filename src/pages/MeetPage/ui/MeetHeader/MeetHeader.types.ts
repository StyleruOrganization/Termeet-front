import type { Meet } from "@/entities/Meet";

export type MeetHeaderProps = Pick<Meet, "description" | "duration" | "name">;
