import { createContext } from "react";
import type { IMeetStore } from "../store/TimeTable";

export const MeetContext = createContext<IMeetStore | null>(null);
