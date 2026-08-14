import type { MeetResponse } from "@/entities/Meet";

export type MeetLiveEvent =
  | { kind: "add"; name: string }
  | { kind: "edit"; name: string }
  | { kind: "remove"; name: string }
  | { kind: "final" }
  | { kind: "more"; extra: number };

type Snapshot = {
  slots: Record<string, string>;
  hasFinal: boolean;
};

export const meetLiveQuietKey = (hash: string) => `termeet-live-quiet:${hash}`;

export const suppressMeetLiveToasts = (hash: string) => {
  try {
    sessionStorage.setItem(meetLiveQuietKey(hash), String(Date.now()));
  } catch {
    // private mode
  }
};

export const isMeetLiveQuiet = (hash: string, windowMs = 8000) => {
  try {
    const started = Number(sessionStorage.getItem(meetLiveQuietKey(hash)) || 0);
    return Date.now() - started < windowMs;
  } catch {
    return false;
  }
};

const slotFingerprint = (slots: [string, string][] | undefined) => {
  return [...(slots ?? [])]
    .map(range => range.join("|"))
    .sort()
    .join(",");
};

export const snapshotMeetLive = (meet: MeetResponse): Snapshot => {
  const slots: Record<string, string> = {};
  (meet.slots ?? []).forEach(slot => {
    slots[slot.name] = slotFingerprint(slot.slots);
  });
  return {
    slots,
    hasFinal: Boolean(meet.finalSlot?.length),
  };
};

export const diffMeetLiveEvents = (prev: Snapshot, next: Snapshot, skipNames: Set<string>): MeetLiveEvent[] => {
  const events: MeetLiveEvent[] = [];
  const prevNames = Object.keys(prev.slots);
  const nextNames = Object.keys(next.slots);

  nextNames.forEach(name => {
    if (skipNames.has(name)) {
      return;
    }
    if (!(name in prev.slots)) {
      events.push({ kind: "add", name });
      return;
    }
    if (prev.slots[name] !== next.slots[name]) {
      events.push({ kind: "edit", name });
    }
  });

  prevNames.forEach(name => {
    if (skipNames.has(name) || name in next.slots) {
      return;
    }
    events.push({ kind: "remove", name });
  });

  if (!prev.hasFinal && next.hasFinal) {
    events.push({ kind: "final" });
  }

  if (events.length <= 3) {
    return events;
  }

  const extra = events.length - 2;
  return [...events.slice(0, 2), { kind: "more", extra }];
};
