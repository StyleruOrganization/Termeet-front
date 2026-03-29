// Mimic the hook returned by `create`
import { useContext } from "react";
import { useStore } from "zustand";
import { MeetContext } from "../context/MeetContext";
import { type IMeetStore } from "../model/Meet.types";

export function useMeetStore<T>(selector: (state: IMeetStore) => T): T {
  const store = useContext(MeetContext);
  if (!store) throw new Error("Missing MeetContext.Provider in the tree");
  return useStore(store, selector);
}
