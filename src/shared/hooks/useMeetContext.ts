import { useContext } from "react";
import { useStore } from "zustand";
import { MeetContext } from "../contexts/MeetContext";
import type { IMeetContext } from "../types/MeetContext.types";

export function useMeetContext<T>(selector: (state: IMeetContext) => T): T {
  const store = useContext(MeetContext);
  if (!store) throw new Error("Missing MeetContext.Provider in the tree");
  return useStore(store, selector);
}
