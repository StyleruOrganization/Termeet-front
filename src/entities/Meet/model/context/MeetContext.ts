import { createContext } from "react";
import type { IMeetStore } from "../store/createMeetStore";

export const MeetContext = createContext<IMeetStore | null>(null);
