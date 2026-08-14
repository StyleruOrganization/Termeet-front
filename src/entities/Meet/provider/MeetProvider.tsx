import { useState, useEffect } from "react";
import { MeetContext } from "../context/MeetContext";
import { createMeetStore } from "../model/store/createMeetStore";
import type { IMeetStore } from "../model/Meet.types";

type MeetProviderProps = React.PropsWithChildren<Partial<IMeetStore>>;

export function MeetProvider({ children, ...initialState }: MeetProviderProps) {
  const [store] = useState(() => createMeetStore(initialState));

  useEffect(() => {
    store.setState({
      timeInfo: initialState.timeInfo,
      timeRanges: initialState.timeRanges,
      users: initialState.users,
      finalSlot: initialState.finalSlot,
    });
  }, [initialState.timeInfo, initialState.timeRanges, initialState.users, initialState.finalSlot, store]);

  return <MeetContext.Provider value={store}>{children}</MeetContext.Provider>;
}
