import { useState } from "react";
import { MeetContext } from "@/shared/contexts/MeetContext";
import { createMeetStore } from "@shared/store/TimeTable";
import type { IMeetContext } from "@shared/types/MeetContext.types";

type IMeetProvider = Partial<React.PropsWithChildren<IMeetContext>>;

export function MeetProvider({ children, ...props }: IMeetProvider) {
  const [store] = useState(() => createMeetStore(props));
  return <MeetContext.Provider value={store}>{children}</MeetContext.Provider>;
}
