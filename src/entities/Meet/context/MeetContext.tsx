import { createContext } from "react";
import { type StoreApi } from "zustand";
import { type IMeetStore } from "../model/Meet.types";

export const MeetContext = createContext<StoreApi<IMeetStore> | null>(null);
