import { createStore } from "zustand";
import type { IMeetContext } from "../Meet.types";

export type IMeetStore = ReturnType<typeof createMeetStore>;

export const createMeetStore = (initProps?: Partial<IMeetContext>) => {
  const DEFAULT_PROPS: IMeetContext = {
    newSelectedSlots: new Map(),
    isEditing: false,
    hoveredUsers: [],
    hoveredUser: "",
    isModalOpen: false,
    setSelectNewSell: () => {},
    setHoveredUsers: () => {},
    setHoveredUser: () => {},
    setIsEditing: () => {},
    clearNewSelectedSlots: () => {},
    setIsModalOpen: () => {},
    getPreparedNewSlots: () => ({ slots: [] }),
    getNewSelectedSlots: () => new Map(),
  };

  return createStore<IMeetContext>()((set, get) => ({
    ...DEFAULT_PROPS,
    ...initProps,
    setSelectNewSell: (date, time, isRemove = false) => {
      set(state => {
        const newSelectedSlots = new Map(state.newSelectedSlots);
        if (!newSelectedSlots.has(date)) {
          newSelectedSlots.set(date, []);
        }

        if (isRemove) {
          newSelectedSlots.set(date, newSelectedSlots.get(date)?.filter(timeValue => timeValue != time) || []);
        } else {
          newSelectedSlots.set(date, [...(newSelectedSlots.get(date) || []), time]);
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

      console.log("allSlots", allSlots);

      // Группируем в непрерывные отрезки
      const slots: string[][] = [];
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

      return {
        slots,
      };
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
  }));
};
