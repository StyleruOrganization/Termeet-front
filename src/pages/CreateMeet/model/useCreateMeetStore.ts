import { create } from "zustand";
import { isDateBeforeToday, startOfToday } from "@/shared/libs";
import { isDurationValid } from "../lib/formatting/timeFormatters";
import type { MeetingFormState, ICreateMeet } from "./createMeet.types";

const validators: {
  [key in keyof ICreateMeet]?: key extends "dates"
    ? (value: ICreateMeet["dates"]) => string | undefined
    : (value: string) => string | undefined;
} = {
  description: (value: string) => {
    if (value.trim().length > 400) return "Описание не должно превышать 400 символов";
    return undefined;
  },
  title: value => {
    if (value.trim().length > 128) return "Название не должно превышать 128 символов";
    return undefined;
  },
  link: (value: string) => {
    if (value.trim().length > 256) return "Размер ссылки не должен превышать 256 символов";
    if (value && !/^https?:\/\/.+/.test(value)) return "Введите корректную ссылку (http:// или https://)";
    return undefined;
  },
  dates: value => {
    let countDays = 0;

    value.forEach(interval => {
      const d1 = new Date(interval.start);
      d1.setHours(0, 0, 0, 0);

      const d2 = new Date(interval.end);
      d2.setHours(0, 0, 0, 0);

      // Разница в миллисекундах
      const diffTime = Math.abs(d2.getTime() - d1.getTime());

      // Переводим в дни
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      countDays += diffDays || 1;
    });

    if (countDays + 1 > 30) return "Максимум можно выбрать 30 дней";
    return undefined;
  },
};

export const useCreateMeetStore = create<MeetingFormState>((set, get) => ({
  values: {
    title: "",
    timeStart: "10 : 00",
    timeEnd: "19 : 00",
    dates: [],
    description: "",
    link: "",
    timeDuration: "",
    invitedUsers: [],
  },
  lastCorrectedValues: {
    timeStart: "10 : 00",
    timeEnd: "19 : 00",
    timeDuration: "",
  },
  errors: {},

  setValue: (name, value) => {
    set(state => ({
      values: { ...state.values, [name]: value },
    }));
  },

  setDate: ({ start, end }, overrideCurrentInterval = false) => {
    if (start == null || end == null) {
      return set(state => ({
        values: {
          ...get().values,
          dates: state.values.dates.filter(
            interval =>
              interval.start.toDateString() != start?.toDateString() &&
              interval.end.toDateString() != end?.toDateString(),
          ),
        },
      }));
    }
    const today = startOfToday();
    const rangeStart = isDateBeforeToday(start) ? today : start;
    const rangeEnd = isDateBeforeToday(end) ? today : end;
    if (rangeEnd < rangeStart) {
      return;
    }
    if (!overrideCurrentInterval) {
      const currentIntervals = get().values.dates;
      // Это интервалы без тех которые попали внутрь нового интервала
      const newIntervals: typeof currentIntervals = [];

      currentIntervals.forEach(interval => {
        if (
          (interval.start < rangeStart && interval.end < rangeStart) ||
          (interval.start > rangeEnd && interval.end > rangeEnd)
        ) {
          console.log("Пушим старый интервал так как он не пересекается с выбранным");
          newIntervals.push({ start: interval.start, end: interval.end });
        }
      });
      newIntervals.push({ start: rangeStart, end: rangeEnd });

      console.log("Всего интервалов получилось", newIntervals.length);
      return set(state => ({
        values: {
          ...state.values,
          dates: [...newIntervals],
        },
      }));
    } else {
      return set(state => ({
        values: {
          ...state.values,
          dates: state.values.dates.map(interval =>
            interval.start?.toDateString() === rangeStart?.toDateString() ||
            interval.end?.toDateString() === rangeEnd?.toDateString()
              ? { start: rangeStart, end: rangeEnd }
              : interval,
          ),
        },
      }));
    }
  },

  setTime: (name, value, isSaveAsLast = true) => {
    if (name == "timeDuration") {
      set(state => ({
        values: {
          ...state.values,
          [name]: value,
        },
        lastCorrectedValues: isSaveAsLast
          ? {
              ...state.lastCorrectedValues,
              [name]: value,
            }
          : { ...state.lastCorrectedValues },
      }));
      return;
    }
    // ХЗ успеет ли стор обновится поэтому делаю так
    const actualValues = {
      timeStart: get().lastCorrectedValues.timeStart,
      timeEnd: get().lastCorrectedValues.timeEnd,
      timeDuration: get().lastCorrectedValues.timeDuration,
      [name]: isSaveAsLast ? value : get().lastCorrectedValues[name],
    };

    let isDurationValueValid = true;

    if (actualValues.timeDuration && actualValues.timeStart && actualValues.timeEnd) {
      isDurationValueValid = isDurationValid(actualValues.timeDuration, actualValues.timeStart, actualValues.timeEnd);
    }

    set(state => ({
      values: {
        ...state.values,
        [name]: value,
        ["timeDuration"]: !isDurationValueValid ? "" : state.values.timeDuration,
      },
      lastCorrectedValues: isSaveAsLast
        ? {
            ...state.lastCorrectedValues,
            [name]: value,
            ["timeDuration"]: !isDurationValueValid ? "" : state.lastCorrectedValues.timeDuration,
          }
        : { ...state.lastCorrectedValues },
    }));
  },

  blurTimeField: name => {
    const lastCorrectedTime = get().lastCorrectedValues[name];
    if (lastCorrectedTime == undefined) return;

    set(state => ({
      values: {
        ...state.values,
        [name]: lastCorrectedTime,
      },
      errors: { ...state.errors, [name]: undefined },
    }));
    return;
  },

  setError: (name, error) =>
    set(state => ({
      errors: {
        ...state.errors,
        [name]: error || undefined,
      },
    })),

  resetForm: () =>
    set({
      values: {
        title: "",
        timeStart: "10 : 00",
        timeEnd: "19 : 00",
        dates: [],
        description: "",
        link: "",
        timeDuration: "",
        invitedUsers: [],
      },
      lastCorrectedValues: {
        timeStart: "10 : 00",
        timeEnd: "19 : 00",
      },
      errors: {},
    }),

  addInvitedUser: user => {
    set(state => {
      if (state.values.invitedUsers.some(item => item.id === user.id)) {
        return state;
      }
      return {
        values: {
          ...state.values,
          invitedUsers: [...state.values.invitedUsers, user],
        },
      };
    });
  },
  removeInvitedUser: id => {
    set(state => ({
      values: {
        ...state.values,
        invitedUsers: state.values.invitedUsers.filter(item => item.id !== id),
      },
    }));
  },

  clearErrors: () => set({ errors: {} }),
  clearError: name =>
    set(state => ({
      errors: {
        ...state.errors,
        [name]: undefined,
      },
    })),
  validateField: name => {
    const value = get().values[name];
    const setError = get().setError;
    const validator = validators[name];

    if (!validator) {
      console.log("validator not found", name);
      return;
    }

    if (Array.isArray(value)) {
      const result = (validator as (value: ICreateMeet["dates"]) => string | undefined)(value);
      setError(name, result);
    } else {
      const result = (validator as (value: string) => string | undefined)(value as string);
      setError(name, result);
    }
    return;
  },
}));
