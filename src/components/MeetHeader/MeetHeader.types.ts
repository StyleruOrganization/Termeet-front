import type { Meet } from "@shared/types/Meet.types";

export type MeetHeaderProps = Pick<Meet, "description" | "duration" | "name">;
