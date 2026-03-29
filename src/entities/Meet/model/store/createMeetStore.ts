import { createStore } from "zustand";
import type { IMeetStore } from "../Meet.types";

export const createMeetStore = (initialState?: Partial<IMeetStore>) => {
  const DEFAULT_PROPS: IMeetStore = {
    newSelectedSlots: new Map(),
    isEditing: false,
    hoveredUsers: [],
    hoveredUser: "",
    isModalOpen: false,
    timeInfo: new Map(),
    timeRanges: [],
    users: [],
    setSelectNewSell: () => {},
    setHoveredUsers: () => {},
    setHoveredUser: () => {},
    setIsEditing: () => {},
    clearNewSelectedSlots: () => {},
    setIsModalOpen: () => {},
    getPreparedNewSlots: () => [],
    getNewSelectedSlots: () => new Map(),
    setUsers: () => {},
    setTimeInfo: () => {},
  };

  return createStore<IMeetStore>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initialState,
    setSelectNewSell: (date, time, isRemove = false) => {
      set(state => {
        const newSelectedSlots = new Map(state.newSelectedSlots);
        if (!newSelectedSlots.has(date)) {
          newSelectedSlots.set(date, []);
        }

        const currentSelectedTimes = newSelectedSlots.get(date) || [];

        console.log("currentSelectedTimes", currentSelectedTimes);

        if (isRemove) {
          if (currentSelectedTimes.length == 1) {
            console.log("delete date from new map newSelectedSlots");
            newSelectedSlots.delete(date);
          } else {
            newSelectedSlots.set(date, currentSelectedTimes.filter(timeValue => timeValue != time) || []);
          }
        } else {
          newSelectedSlots.set(date, [...currentSelectedTimes, time]);
        }
        return {
          newSelectedSlots,
        };
      });
    },
    getPreparedNewSlots: () => {
      const newSelectedSlots = get().newSelectedSlots;
      const allSlots: Date[] = [];

      newSelectedSlots.forEach((times, date) => {
        times.forEach(time => {
          const localDate = new Date(`${date}T${time}`);

          allSlots.push(localDate);
        });
      });

      // Сортируем по возрастанию даты и времени
      allSlots.sort((a, b) => a.getTime() - b.getTime());

      // Группируем в непрерывные отрезки
      const slots: [string, string][] = [];
      let currentSegment: Date[] = [];

      allSlots.forEach((slot, index) => {
        if (index === 0) {
          currentSegment = [slot];
          return;
        }

        // Если слоты из одного дня по местному и они отличаются на 30 минут
        if (
          slot.getDate() === currentSegment[currentSegment.length - 1].getDate() &&
          slot.getTime() - currentSegment[currentSegment.length - 1].getTime() === 30 * 60 * 1000
        ) {
          currentSegment.push(slot);
          return;
        } else {
          slots.push([currentSegment[0].toISOString(), currentSegment[currentSegment.length - 1].toISOString()]);
          currentSegment = [slot];
        }
      });

      // Добавляем последний отрезок
      if (currentSegment.length > 0) {
        slots.push([currentSegment[0].toISOString(), currentSegment[currentSegment.length - 1].toISOString()]);
      }

      return slots;
    },
    getNewSelectedSlots: () => {
      return get().newSelectedSlots;
    },
    setHoveredUser: hoveredUser => {
      set(() => ({
        hoveredUser,
      }));
    },
    setHoveredUsers: hoveredUsers => {
      set(state => {
        let isChanged = false;
        const oldHoveredUsers = state.hoveredUsers;
        if (hoveredUsers.length !== oldHoveredUsers.length) {
          isChanged = true;
        }
        for (const user of hoveredUsers) {
          if (!oldHoveredUsers.includes(user)) {
            isChanged = true;
            break;
          }
        }

        if (isChanged) {
          return {
            hoveredUsers,
          };
        }

        return {
          hoveredUsers: state.hoveredUsers,
        };
      });
    },
    setIsEditing: isEditing => {
      set(() => ({
        isEditing,
      }));
    },
    clearNewSelectedSlots: () => {
      set(() => ({
        newSelectedSlots: new Map(),
      }));
    },
    setIsModalOpen: isModalOpen => {
      set(() => ({
        isModalOpen,
      }));
    },
    setUsers: users => {
      set(() => ({
        users,
      }));
    },
    setTimeInfo: timeInfo => {
      set(() => ({
        timeInfo,
      }));
    },
  }));
};
