import { createStore } from "zustand";
import type { IMeetContext } from "../Meet.types";

export type IMeetStore = ReturnType<typeof createMeetStore>;

export const createMeetStore = (initProps?: Partial<IMeetContext>) => {
  const DEFAULT_PROPS: IMeetContext = {
    newSelectedSlots: new Map(),
    oldSelectedSlots: new Map(),
    maxSelectCount: 0,
    isEditing: false,
    users: [],
    hoveredUsers: [],
    hoveredUser: "",
    isModalOpen: false,
    setSelectNewSell: () => {},
    saveNewSelectedSlots: () => {},
    setHoveredUsers: () => {},
    setHoveredUser: () => {},
    setIsEditing: () => {},
    clearNewSelectedSlots: () => {},
    setIsModalOpen: () => {},
  };

  return createStore<IMeetContext>()(set => ({
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
    saveNewSelectedSlots: userName => {
      set(state => {
        const oldSelectedSlots = new Map(state.oldSelectedSlots);
        const newSelectedSlots = new Map(state.newSelectedSlots);
        let maxSelectCountNew = state.maxSelectCount;

        const newSelectedEntries = Array.from(newSelectedSlots.entries());

        for (const [date, times] of newSelectedEntries) {
          if (!oldSelectedSlots.has(date)) {
            oldSelectedSlots.set(date, new Map());
          }
          const oldSelectedSlotsDate = oldSelectedSlots.get(date);

          for (const time of times) {
            if (!oldSelectedSlotsDate?.has(time)) {
              oldSelectedSlotsDate?.set(time, []);
            }
            const countPeoples = oldSelectedSlotsDate?.get(time)?.length || 0;
            oldSelectedSlotsDate?.set(time, [...(oldSelectedSlotsDate?.get(time) || []), userName]);

            if (countPeoples + 1 > maxSelectCountNew) {
              maxSelectCountNew = countPeoples + 1;
            }
          }
        }

        return {
          oldSelectedSlots,
          newSelectedSlots,
          maxSelectCount: maxSelectCountNew,
          users: [...state.users, userName],
        };
      });
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
