import { convertUTCToTimezone, generateTimeOptions } from "@/shared/libs";
import type { IMeet, MeetResponse } from "@/entities/Meet";

const getMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export const transformMeetData = (meetData: MeetResponse, isLocal: boolean): IMeet => {
  const meetingDays = new Set<string>();
  const users = new Set<string>();
  const timeRanges: IMeet["timeRanges"] = [];
  const timeInfo: IMeet["timeInfo"] = new Map();

  const timeZoneOffset = isLocal ? -new Date().getTimezoneOffset() / 60 : 3;
  // Переводим UTC в нужное время - это дни в которые проходит встреча
  const preparedMeetDataDataRanges = meetData.dataRange.map(([startTime, endTime]) => [
    convertUTCToTimezone(startTime, timeZoneOffset),
    convertUTCToTimezone(endTime, timeZoneOffset),
  ]);
  // Также поступаем и со слотами
  const preparedMeetDataTimeSlots = meetData.slots.map(userInfo => {
    const { name, slots } = userInfo;
    users.add(name);
    const convertedSlots: [string, string][] = slots.map(([startTime, endTime]) => [
      convertUTCToTimezone(startTime, timeZoneOffset),
      convertUTCToTimezone(endTime, timeZoneOffset),
    ]);
    return {
      ...userInfo,
      slots: convertedSlots,
    };
  });

  console.log("MEET DATA AFTER Convertion", preparedMeetDataDataRanges, preparedMeetDataTimeSlots);

  // Определяем промежутки времени общие для всех, для отображения времени слева, а также промежутки для каждого дня - инициализируем мапу, ту страшную
  preparedMeetDataDataRanges.forEach(([startTimeRange, endTimeRange]) => {
    const [startDate, startTime] = startTimeRange.split("T");
    const [endDate, endTime] = endTimeRange.split("T");

    const processedStartTime = startTime.split(":").slice(0, 2).join(":");
    const processedEndTime = endTime.split(":").slice(0, 2).join(":");

    meetingDays.add(startDate);
    meetingDays.add(endDate);

    // Произошел переход, из-за часового пояса
    if (startDate !== endDate) {
      const oldTimeRangesStartDate = timeInfo.get(startDate)?.timeRanges || [];
      const oldTimeRangesEndDate = timeInfo.get(endDate)?.timeRanges || [];
      let newTimeRangesStartDate: [string, string][] = [];
      let newTimeRangesEndDate: [string, string][] = [];

      // Схлопываем промежутки времени если произошел переход, но пустых слотов быть между ними не должно.
      // Это случай когда встреча с 00:00 до 23:30
      let isMergingInStartTimeRange = false;
      newTimeRangesStartDate = oldTimeRangesStartDate.map(([startTimeOldRange, endTimeOldRange]) => {
        if (getMinutes(processedStartTime) - getMinutes(endTimeOldRange) == 30) {
          isMergingInStartTimeRange = true;
          return [startTimeOldRange, "23:00"];
        } else {
          return [startTimeOldRange, endTimeOldRange];
        }
      });

      let isMergingInEndTimeRange = false;
      newTimeRangesEndDate = oldTimeRangesEndDate.map(([startTimeOldRange, endTimeOldRange]) => {
        if (getMinutes(startTimeOldRange) - getMinutes(processedEndTime) == 30) {
          isMergingInEndTimeRange = true;
          const newEndTime = getMinutes(endTimeOldRange) - 30;
          return [
            "00:00",
            `${Math.floor(newEndTime / 60)
              .toString()
              .padStart(2, "0")}:${(newEndTime % 60).toString().padStart(2, "0")}`,
          ];
        } else {
          return [startTimeOldRange, endTimeOldRange];
        }
      });

      if (!isMergingInStartTimeRange) {
        newTimeRangesStartDate.push([processedStartTime, "23:00"]);
      }
      if (!isMergingInEndTimeRange) {
        const newEndTime = getMinutes(processedEndTime) - 30;
        newTimeRangesEndDate.push([
          "00:00",
          `${Math.floor(newEndTime / 60)
            .toString()
            .padStart(2, "0")}:${(newEndTime % 60).toString().padStart(2, "0")}`,
        ]);
      }

      timeInfo.set(startDate, {
        userSlots: new Map(),
        timeRanges: [...newTimeRangesStartDate],
      });

      timeInfo.set(endDate, {
        userSlots: new Map(),
        timeRanges: [...newTimeRangesEndDate],
      });

      // Устанавливаем, один раз промежутки общие для всех дней, для часиков слева от таблички
      if (timeRanges.length === 0) {
        // А здесь можно вот так вот смерджить
        if (isMergingInEndTimeRange || isMergingInStartTimeRange) {
          timeRanges.push(["00:00", "23:00"]);
        } else {
          const newEndTime = getMinutes(processedEndTime) - 30;
          timeRanges.push([processedStartTime, "23:00"]);
          timeRanges.push([
            "00:00",
            `${Math.floor(newEndTime / 60)
              .toString()
              .padStart(2, "0")}:${(newEndTime % 60).toString().padStart(2, "0")}`,
          ]);
        }
      }
    }
    // Еще важно, что если есть переход то он есть абсолютно во всех днях
    else {
      const newEndTime = getMinutes(processedEndTime) - 30;
      if (timeRanges.length === 0) {
        timeRanges.push([
          processedStartTime,
          `${Math.floor(newEndTime / 60)
            .toString()
            .padStart(2, "0")}:${(newEndTime % 60).toString().padStart(2, "0")}`,
        ]);
      }
      meetingDays.add(startDate);
      timeInfo.set(startDate, {
        ...timeInfo.get(startDate),
        userSlots: new Map(),
        timeRanges: [
          [
            processedStartTime,
            `${Math.floor(newEndTime / 60)
              .toString()
              .padStart(2, "0")}:${(newEndTime % 60).toString().padStart(2, "0")}`,
          ],
        ],
      });
    }
  });

  // Заносим в каждую дату слоты пользователей и считаем максимальное кол-во людей проголосовавших за одно время
  preparedMeetDataTimeSlots.forEach(userInfo => {
    const { name: userName, slots: userSlots } = userInfo;
    users.add(userName);
    userSlots.forEach(([startTimeRange, endTimeRange]) => {
      const [startDate, startTime] = startTimeRange.split("T");
      const [endDate, endTime] = endTimeRange.split("T");

      if (startDate !== endDate) {
        const startDateRangeOptions = generateTimeOptions(startTime, "00:00:00");
        const enddDateRangeOptions = generateTimeOptions("00:00:00", endTime);
        const oldSlotsStartDate = timeInfo.get(startDate)?.userSlots || new Map<string, string[]>();
        const oldSlotsEndDate = timeInfo.get(endDate)?.userSlots || new Map<string, string[]>();

        startDateRangeOptions.forEach(time => {
          const key = `${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}`;
          const oldUsers = oldSlotsStartDate.get(key) || [];
          oldSlotsStartDate.set(key, [...oldUsers, userName]);
        });

        enddDateRangeOptions.forEach(time => {
          const key = `${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}`;
          const oldUsers = oldSlotsEndDate.get(key) || [];
          oldSlotsEndDate.set(key, [...oldUsers, userInfo.name]);
        });

        timeInfo.set(startDate, {
          timeRanges: timeInfo.get(startDate)?.timeRanges || [],
          userSlots: oldSlotsStartDate,
        });

        timeInfo.set(endDate, {
          timeRanges: timeInfo.get(endDate)?.timeRanges || [],
          userSlots: oldSlotsEndDate,
        });
      } else {
        const timeOptions = generateTimeOptions(startTime, endTime);
        const oldTimeSlots = timeInfo.get(startDate)?.userSlots || new Map<string, string[]>();

        timeOptions.forEach(time => {
          const key = `${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}`;
          const oldUsers = oldTimeSlots.get(key) || [];
          oldTimeSlots.set(key, [...oldUsers, userInfo.name]);
        });

        timeInfo.set(startDate, {
          timeRanges: timeInfo.get(startDate)?.timeRanges || [],
          userSlots: oldTimeSlots,
        });
      }
    });
  });

  const processedData: IMeet = {
    name: meetData.name,
    description: meetData.description || undefined,
    link: meetData.link || undefined,
    duration: meetData.duration || undefined,
    meeting_days: Array.from(meetingDays).sort((a, b) => a.localeCompare(b)),
    timeRanges: timeRanges.sort((a, b) => {
      const startA = a[0];
      const startB = b[0];

      if (startA === "00:00:00" && startB !== "00:00:00") return -1;
      if (startB === "00:00:00" && startA !== "00:00:00") return 1;

      return startA.localeCompare(startB);
    }),
    timeInfo,
    users: Array.from(users),
  };

  return processedData;
};
