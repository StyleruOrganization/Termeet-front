import { useState, useEffect } from "react";
import { MeetContext } from "../context/MeetContext";
import { createMeetStore } from "../model/store/createMeetStore";
import type { IMeetStore } from "../model/Meet.types";

type MeetProviderProps = React.PropsWithChildren<Partial<IMeetStore>>;

export function MeetProvider({ children, ...initialState }: MeetProviderProps) {
  const [store] = useState(() => createMeetStore(initialState));

  useEffect(() => {
    // Don't overwrite store defaults with `undefined` when a prop is omitted.
    // This also makes CT harnesses easier (some complex values like Map are initialized at runtime).
    const next: Partial<IMeetStore> = {};
    if (initialState.timeInfo !== undefined) next.timeInfo = initialState.timeInfo;
    if (initialState.timeRanges !== undefined) next.timeRanges = initialState.timeRanges;
    if (initialState.users !== undefined) next.users = initialState.users;
    store.setState(next);
  }, [initialState.timeInfo, initialState.timeRanges, initialState.users, store]);

  return <MeetContext.Provider value={store}>{children}</MeetContext.Provider>;
}
