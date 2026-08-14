import { createStore } from "zustand";
import type { IMeetStore } from "../Meet.types";

export const createMeetStore = (initialState?: Partial<IMeetStore>) => {
  const DEFAULT_PROPS: IMeetStore = {
    newSelectedSlots: new Map(),
    isEditing: false,
    isFinalizing: false,
    hoveredUsers: {
      users: [],
      isEmptySlot: false,
    },
    hoveredUser: "",
    isModalOpen: false,
    timeInfo: new Map(),
    timeRanges: [],
    users: [],
    timeIsAdded: false,
    finalSlot: new Map(),
    setSelectNewSell: () => {},
    setHoveredUsers: () => {},
    setHoveredUser: () => {},
    setIsEditing: () => {},
    startEditingSlots: () => {},
    startFinalizing: () => {},
    clearNewSelectedSlots: () => {},
    setIsModalOpen: () => {},
    getPreparedNewSlots: () => [],
    getNewSelectedSlots: () => new Map(),
    setUsers: () => {},
    setTimeInfo: () => {},
    setTimeIsAdded: () => {},
  };

  return createStore<IMeetStore>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initialState,
    setSelectNewSell: (date, time, isRemove = false) => {
      set(state => {
        console.log("setSelectNewSell", date, time, isRemove);
        const newSelectedSlots = new Map(state.newSelectedSlots);
        if (!newSelectedSlots.has(date)) {
          newSelectedSlots.set(date, []);
        }

        const currentSelectedTimes = newSelectedSlots.get(date) || [];

        if (isRemove) {
          if (currentSelectedTimes.length == 1 && currentSelectedTimes.includes(time)) {
            console.log("delete time array", time, currentSelectedTimes);
            newSelectedSlots.delete(date);
          } else {
            newSelectedSlots.set(date, currentSelectedTimes.filter(timeValue => timeValue != time) || []);
          }
        } else {
          if (state.isFinalizing) {
            Array.from(newSelectedSlots.keys()).forEach(key => {
              if (key !== date) {
                newSelectedSlots.delete(key);
              }
            });
          }
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
    setHoveredUsers: (hoveredUsers: string[], isEmptySlot: boolean) => {
      set(state => {
        let isChanged = false;
        const oldHoveredUsers = state.hoveredUsers;
        if (hoveredUsers.length !== oldHoveredUsers.users.length || isEmptySlot !== oldHoveredUsers.isEmptySlot) {
          isChanged = true;
        }
        for (const user of hoveredUsers) {
          if (!oldHoveredUsers.users.includes(user)) {
            isChanged = true;
            break;
          }
        }

        if (isChanged) {
          return {
            hoveredUsers: {
              users: hoveredUsers,
              isEmptySlot,
            },
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
        isFinalizing: isEditing ? get().isFinalizing : false,
      }));
    },
    startEditingSlots: (userName, preset) => {
      if (preset) {
        const next = new Map<string, string[]>();
        preset.forEach((times, date) => next.set(date, [...times]));
        set({ isEditing: true, isFinalizing: false, newSelectedSlots: next });
        return;
      }

      if (!userName) {
        set({ isEditing: true, isFinalizing: false, newSelectedSlots: new Map() });
        return;
      }

      const next = new Map<string, string[]>();
      get().timeInfo.forEach((inner, date) => {
        const times: string[] = [];
        inner.userSlots.forEach((users, time) => {
          if (users.includes(userName)) {
            times.push(time);
          }
        });
        if (times.length) {
          next.set(date, times);
        }
      });

      set({ isEditing: true, isFinalizing: false, newSelectedSlots: next });
    },
    startFinalizing: preset => {
      const next = new Map<string, string[]>();
      preset?.forEach((times, date) => next.set(date, [...times]));
      set({ isEditing: true, isFinalizing: true, newSelectedSlots: next });
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
    setTimeIsAdded: () => {
      set(() => ({
        timeIsAdded: true,
      }));
    },
  }));
};
