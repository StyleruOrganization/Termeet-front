import { apiClient } from "@/shared/api";
import { generateTimeOptions, getLocalTime } from "@/shared/libs";
import { meetResponseSchema, type MeetResponse } from "../model/Meet.schema";
import type { IMeet } from "../model/Meet.types";

export const getMeet = async (hash: string) => {
  const data = await apiClient.get<MeetResponse>(`/meet/${hash}`, {}, meetResponseSchema);
  const meetingDays = new Set<string>();
  const users = new Set<string>();
  const timeRanges: IMeet["timeRanges"] = [];
  const timeInfo: IMeet["timeInfo"] = new Map();
  let maxSelectCount = 0;

  // Преобразуем в локальное время пользователя
  data.timeRange = data.timeRange.map(([startRange, endRange]) => [getLocalTime(startRange), getLocalTime(endRange)]);
  data.slots = data.slots.map(userInfo => ({
    name: userInfo.name,
    slots: userInfo.slots.map(slot => [getLocalTime(slot[0]), getLocalTime(slot[1])]),
  }));

  // Определяем промежутки времени общие для всех, для отображения времени слева, а также промежутки для каждого дня - инициализируем мапу, ту страшную
  data.timeRange.forEach(timeRange => {
    const [startDate, startTime] = timeRange[0].split("T");
    const [endDate, endTime] = timeRange[1].split("T");

    // Произошел переход на следующий день
    if (startDate !== endDate) {
      const oldTimeRangesStartDate = timeInfo.get(startDate)?.timeRanges || [];
      const oldTimeRangesEndDate = timeInfo.get(endDate)?.timeRanges || [];
      meetingDays.add(startDate);
      meetingDays.add(endDate);

      let isMergingFirstTimeRange = false;
      oldTimeRangesStartDate.map(([startTimeOldRange, endTimeOldRange]) => {
        if (endTimeOldRange == startTime) {
          isMergingFirstTimeRange = true;
          return [startTimeOldRange, "00:00:00"];
        } else {
          return [startTimeOldRange, endTimeOldRange];
        }
      });

      let isMergingSecondTimeRange = false;
      oldTimeRangesEndDate.map(([startTimeOldRange, endTimeOldRange]) => {
        if (startTimeOldRange == endTime) {
          isMergingSecondTimeRange = true;
          return ["00:00:00", endTimeOldRange];
        } else {
          return [startTimeOldRange, endTimeOldRange];
        }
      });

      if (!isMergingFirstTimeRange) {
        timeInfo.set(startDate, {
          userSlots: new Map(),
          timeRanges: [...(timeInfo.get(startDate)?.timeRanges || []), [startTime, "23:30:00"]],
        });
      }

      if (!isMergingSecondTimeRange) {
        timeInfo.set(endDate, {
          userSlots: new Map(),
          timeRanges: [...(timeInfo.get(endDate)?.timeRanges || []), ["00:00:00", endTime]],
        });
      }

      if (timeRanges.length === 0) {
        timeRanges.push([startTime, "23:30:00"]);
        timeRanges.push(["00:00:00", endTime]);
      }
    } else {
      if (timeRanges.length === 0) {
        timeRanges.push([startTime, endTime]);
      }
      meetingDays.add(startDate);
      timeInfo.set(startDate, {
        ...timeInfo.get(startDate),
        userSlots: new Map(),
        timeRanges: [[startTime, endTime]],
      });
    }
  });

  // Заносим в каждую дату слоты пользователей и считаем максимальное кол-во людей проголосовавших за одно время
  data.slots.forEach(userInfo => {
    users.add(userInfo.name);
    userInfo.slots.forEach(range => {
      const [startDate, startTime] = range[0].split("T");
      const [endDate, endTime] = range[1].split("T");

      if (startDate !== endDate) {
        const firstRangeOptions = generateTimeOptions(startTime, "00:00:00");
        const secondRangeOptions = generateTimeOptions("00:00:00", endTime);
        const oldTimeSlotsStart = timeInfo.get(startDate)?.userSlots;
        const oldTimeSlotsEnd = timeInfo.get(endDate)?.userSlots;

        // Инициализация была выше и здесь уже должно быть все готово
        if (!oldTimeSlotsEnd || !oldTimeSlotsStart) {
          console.error("Alarm, есть слот а даты под него нету");
          return;
        }

        firstRangeOptions.forEach(time => {
          const key = `${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}`;
          const oldSlots = oldTimeSlotsStart.get(key) || [];
          oldTimeSlotsStart.set(key, [...oldSlots, userInfo.name]);

          if (oldSlots.length + 1 > maxSelectCount) {
            maxSelectCount = oldSlots.length + 1;
          }
        });

        secondRangeOptions.forEach(time => {
          const key = `${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}`;
          const oldSlots = oldTimeSlotsEnd.get(key) || [];
          oldTimeSlotsEnd.set(key, [...oldSlots, userInfo.name]);

          if (oldSlots.length + 1 > maxSelectCount) {
            maxSelectCount = oldSlots.length + 1;
          }
        });

        timeInfo.set(startDate, {
          timeRanges: timeInfo.get(startDate)?.timeRanges || [],
          userSlots: oldTimeSlotsStart,
        });

        timeInfo.set(endDate, {
          timeRanges: timeInfo.get(endDate)?.timeRanges || [],
          userSlots: oldTimeSlotsEnd,
        });
      } else {
        const timeOptions = generateTimeOptions(startTime, endTime);
        const oldTimeSlots = timeInfo.get(startDate)?.userSlots;

        // Инициализация была выше и здесь уже должно быть все готово
        if (!oldTimeSlots) {
          console.error("Alarm, есть слот а даты под него нету");
          return;
        }
        timeOptions.forEach(time => {
          const key = `${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}`;
          const oldSlots = oldTimeSlots.get(key) || [];
          oldTimeSlots.set(key, [...oldSlots, userInfo.name]);

          if (oldSlots.length + 1 > maxSelectCount) {
            maxSelectCount = oldSlots.length + 1;
          }
        });

        timeInfo.set(startDate, {
          timeRanges: timeInfo.get(startDate)?.timeRanges || [],
          userSlots: oldTimeSlots,
        });
      }
    });
  });

  const processedData: IMeet = {
    name: data.name,
    description: data.description || undefined,
    link: data.link || undefined,
    duration: data.duration || undefined,
    meeting_days: Array.from(meetingDays).sort((a, b) => a.localeCompare(b)),
    timeRanges: timeRanges.sort((a, b) => {
      const startA = a[0];
      const startB = b[0];

      if (startA === "00:00:00" && startB !== "00:00:00") return -1;
      if (startB === "00:00:00" && startA !== "00:00:00") return 1;

      return startA.localeCompare(startB);
    }),
    timeInfo,
    maxSelectCount,
    users: Array.from(users),
  };
  return processedData;
};
