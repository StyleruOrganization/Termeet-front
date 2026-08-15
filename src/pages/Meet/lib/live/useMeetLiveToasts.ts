import { useEffect, useRef } from "react";
import { useToastStore } from "@/features/ToastContainer";
import { useTranslation } from "@/shared/i18n";
import { diffMeetLiveEvents, isMeetLiveQuiet, snapshotMeetLive, type MeetLiveEvent } from "./meetLiveUpdates";
import type { MeetResponse } from "@/entities/Meet";

const eventMessage = (event: MeetLiveEvent, t: (key: string, options?: Record<string, unknown>) => string) => {
  if (event.kind === "add") {
    return t("toast.liveVoted", { name: event.name });
  }
  if (event.kind === "edit") {
    return t("toast.liveChanged", { name: event.name });
  }
  if (event.kind === "remove") {
    return t("toast.liveRemoved", { name: event.name });
  }
  if (event.kind === "final") {
    return t("toast.liveFinal");
  }
  if (event.kind === "finalEdit") {
    return t("toast.liveFinalEdit");
  }
  if (event.kind === "info") {
    return t("toast.liveInfo");
  }
  return t("toast.liveMore", { count: event.extra });
};

export const useMeetLiveToasts = (hash: string, meet: MeetResponse, mySlotName: string | null) => {
  const addToast = useToastStore(state => state.addToast);
  const { t } = useTranslation();
  const hashRef = useRef(hash);
  const readyRef = useRef(false);
  const previousRef = useRef(snapshotMeetLive(meet));

  useEffect(() => {
    const next = snapshotMeetLive(meet);

    if (hashRef.current !== hash) {
      hashRef.current = hash;
      previousRef.current = next;
      readyRef.current = true;
      return;
    }

    const previous = previousRef.current;
    previousRef.current = next;

    if (!readyRef.current) {
      readyRef.current = true;
      return;
    }

    if (isMeetLiveQuiet(hash)) {
      return;
    }

    const skipNames = new Set<string>();
    if (mySlotName) {
      skipNames.add(mySlotName);
    }

    diffMeetLiveEvents(previous, next, skipNames).forEach((event, index) => {
      addToast({
        id: `meet-live-${hash}-${event.kind}-${index}-${Date.now()}`,
        type: event.kind === "final" || event.kind === "finalEdit" ? "success" : "info",
        duration: 6000,
        message: eventMessage(event, t),
      });
    });
  }, [addToast, hash, meet, mySlotName, t]);
};
