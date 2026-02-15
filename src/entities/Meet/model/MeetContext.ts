import { createContext } from "react";
import type { IMeetStore } from "./createMeetStore";

export const MeetContext = createContext<IMeetStore | null>(null);
