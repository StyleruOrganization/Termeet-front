import { useMemo } from "react";
import { generateTimeOptions } from "@shared/utils/timeFormatters";
import type { SelectedSlots } from "@/shared/types/MeetContext.types";
import type { IMeetingInfo } from "@shared/types/Meet.types";

// Хотим посчитать кол-во людей, которые выбрали одно время, а также смерджить времена всех людей в один объект, а также юзером в массив собрать
// мб схему поменять надо и на беке все считать
export const useInitialContextValue = (userSlots: IMeetingInfo["userSlots"]) => {
  const meetInfo = useMemo(() => {
    const formattedUserSlots: SelectedSlots = new Map();
    const users = new Set<string>();

    let maxSelectCount = 0;
    for (const userData of userSlots) {
      for (const slot of userData.slots) {
        const { start_time: start_period_time, end_time: end_period_time } = slot;
        const [start_date, start_time] = start_period_time.split("T");
        const [end_date, end_time] = end_period_time.split("T");
        if (start_date !== end_date) {
          throw new Error("Бля, такого быть не может");
        }

        const timeOptions = generateTimeOptions(start_time, end_time);

        if (!formattedUserSlots.has(start_date)) {
          formattedUserSlots.set(start_date, new Map());
        }

        const dateMap = formattedUserSlots.get(start_date) as Map<string, string[]>;
        for (const [hours, minutes] of timeOptions) {
          const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00Z`;
          if (!dateMap.has(time)) {
            dateMap.set(time, []);
          }
          const usersTime = dateMap.get(time);
          usersTime?.push(userData.user);
          users.add(userData.user);

          if (usersTime && usersTime.length > maxSelectCount) {
            maxSelectCount = usersTime.length;
          }
        }
      }
    }

    return {
      formattedUserSlots,
      maxSelectCount,
      users: Array.from(users),
    };
  }, [userSlots]);

  return meetInfo;
};
