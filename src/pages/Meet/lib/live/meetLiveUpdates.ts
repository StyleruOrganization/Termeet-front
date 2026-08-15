import { getMeetDateRange, type MeetResponse } from "@/entities/Meet";

export type MeetLiveEvent =
  | { kind: "add"; name: string }
  | { kind: "edit"; name: string }
  | { kind: "remove"; name: string }
  | { kind: "final" }
  | { kind: "finalEdit" }
  | { kind: "info" }
  | { kind: "more"; extra: number };

type Snapshot = {
  slots: Record<string, string>;
  hasFinal: boolean;
  final: string;
  info: string;
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

const finalSlotsOf = (meet: MeetResponse) => {
  const fromCamel = meet.finalSlot;
  if (Array.isArray(fromCamel) && fromCamel.length) {
    return fromCamel;
  }
  const fromSnake = meet.final_slot;
  return Array.isArray(fromSnake) ? fromSnake : fromCamel;
};

const slotFingerprint = (slots: [string, string][] | undefined) => {
  return [...(slots ?? [])]
    .map(range => {
      if (!Array.isArray(range) || range.length < 2) {
        return String(range ?? "");
      }
      return range
        .slice(0, 2)
        .map(value => {
          const stamp = Date.parse(value);
          return Number.isNaN(stamp) ? value : String(stamp);
        })
        .join("|");
    })
    .sort()
    .join(",");
};

const infoFingerprint = (meet: MeetResponse) => {
  const dates = getMeetDateRange(meet)
    .map(range => range.join("|"))
    .sort()
    .join(",");
  return [meet.name ?? "", meet.description ?? "", meet.link ?? "", meet.duration ?? "", dates].join("\n");
};

export const snapshotMeetLive = (meet: MeetResponse): Snapshot => {
  const slots: Record<string, string> = {};
  (meet.slots ?? []).forEach(slot => {
    slots[slot.name] = slotFingerprint(slot.slots);
  });
  const finalSlots = finalSlotsOf(meet);
  return {
    slots,
    hasFinal: Boolean(finalSlots?.length),
    final: slotFingerprint(finalSlots),
    info: infoFingerprint(meet),
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

  if (prev.info !== next.info) {
    events.push({ kind: "info" });
  }

  if (prev.final !== next.final && next.hasFinal) {
    events.unshift({ kind: prev.hasFinal ? "finalEdit" : "final" });
  }

  if (events.length <= 3) {
    return events;
  }

  const extra = events.length - 2;
  return [...events.slice(0, 2), { kind: "more", extra }];
};
