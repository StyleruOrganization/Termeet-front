import type { IMeet } from "@/entities/Meet";

export const peopleAtCell = (timeInfo: IMeet["timeInfo"], date: string, time: string) => {
  return timeInfo.get(date)?.userSlots.get(time) ?? [];
};

export const peopleAtSelection = (timeInfo: IMeet["timeInfo"], selected: Map<string, string[]>) => {
  let result: string[] | null = null;

  selected.forEach((times, date) => {
    times.forEach(time => {
      const people = peopleAtCell(timeInfo, date, time);
      if (result === null) {
        result = [...people];
        return;
      }
      result = result.filter(name => people.includes(name));
    });
  });

  return result ?? [];
};
