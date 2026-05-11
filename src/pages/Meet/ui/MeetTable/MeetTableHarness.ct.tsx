import { useEffect } from "react";
import { MeetProvider, useMeetStore } from "@entities/Meet";
import { MeetTable } from "./MeetTable";

type TimeRange = [string, string];

function buildTimeInfo(days: string[], rangesByDay: Map<string, TimeRange[]>) {
  const timeInfo = new Map<string, { timeRanges: TimeRange[]; userSlots: Map<string, string[]> }>();
  for (const day of days) {
    const timeRanges = rangesByDay.get(day) ?? [];
    // Keep userSlots deterministic — a couple of filled cells to render "has users" styles.
    const userSlots = new Map<string, string[]>();
    userSlots.set("10:00", ["Пользователь Альфа"]);
    userSlots.set("11:00", ["Пользователь Альфа", "Пользователь Бета"]);
    timeInfo.set(day, { timeRanges, userSlots });
  }
  return timeInfo;
}

function MeetTableStateInit({
  days,
  timeInfo,
}: {
  days: string[];
  timeInfo: Map<string, { timeRanges: TimeRange[]; userSlots: Map<string, string[]> }>;
}) {
  const setTimeInfo = useMeetStore(s => s.setTimeInfo);
  const setUsers = useMeetStore(s => s.setUsers);

  useEffect(() => {
    // Important for CT: build Maps in browser runtime (Map props may get serialized away).
    setUsers(["Пользователь Альфа", "Пользователь Бета"]);
    setTimeInfo(timeInfo);
  }, [days, timeInfo, setTimeInfo, setUsers]);

  return null;
}

export function MeetTableHarnessCt({
  meetingDays = ["2030-06-15"],
  tableTimeRanges = [["10:00", "14:00"]],
  rangesByDay,
}: {
  meetingDays?: string[];
  tableTimeRanges?: TimeRange[];
  /** Allows per-day ranges to trigger fake before/after cells. */
  rangesByDay?: Map<string, TimeRange[]>;
}) {
  const resolvedRangesByDay = rangesByDay ?? new Map<string, TimeRange[]>(meetingDays.map(d => [d, tableTimeRanges]));
  const timeInfo = buildTimeInfo(meetingDays, resolvedRangesByDay);

  return (
    <MeetProvider timeRanges={tableTimeRanges} users={[]}>
      <MeetTableStateInit days={meetingDays} timeInfo={timeInfo} />
      <div style={{ width: 900, padding: 16, background: "var(--fill-bg)" }}>
        <MeetTable meeting_days={meetingDays} timeRanges={tableTimeRanges} />
      </div>
    </MeetProvider>
  );
}
