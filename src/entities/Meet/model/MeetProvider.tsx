import { useState } from "react";
import { createMeetStore } from "./createMeetStore";
import { MeetContext } from "./MeetContext";
import type { IMeetContext } from "./Meet.types";

type IMeetProvider = Partial<React.PropsWithChildren<IMeetContext>>;

export function MeetProvider({ children, ...props }: IMeetProvider) {
  const [store] = useState(() => createMeetStore(props));
  return <MeetContext.Provider value={store}>{children}</MeetContext.Provider>;
}
