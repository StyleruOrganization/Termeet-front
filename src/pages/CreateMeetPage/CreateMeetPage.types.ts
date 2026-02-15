import z from "zod";
import { createMeetSchema } from "./model";

export type ICreateMeet = z.infer<typeof createMeetSchema>;

export type MeetingFields = "title" | "description" | "time.start" | "time.end" | "time.duration" | "date" | "link";
