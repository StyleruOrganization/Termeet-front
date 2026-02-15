import type { Meet } from "@/entities/Meet/model/Meet.types";

export type MeetHeaderProps = Pick<Meet, "description" | "duration" | "name">;
