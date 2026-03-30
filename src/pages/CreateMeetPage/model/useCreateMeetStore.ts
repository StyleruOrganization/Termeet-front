import { create } from "zustand";
import { isDurationValid } from "../lib/formatting/timeFormatters";
import type { MeetingFormState, ICreateMeet } from "./createMeet.types";

const validators: {
  [key in keyof ICreateMeet]?: key extends "dates"
    ? (value: string[]) => string | undefined
    : (value: string) => string | undefined;
} = {
  description: (value: string) => {
    if (value.length > 400) return "Описание не должно превышать 400 символов";
    return undefined;
  },
  link: (value: string) => {
    if (value && !/^https?:\/\/.+/.test(value)) return "Введите корректную ссылку (http:// или https://)";
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

    console.log("actualValues", actualValues);

    let isDurationValueValid = true;

    if (actualValues.timeDuration && actualValues.timeStart && actualValues.timeEnd) {
      isDurationValueValid = isDurationValid(actualValues.timeDuration, actualValues.timeStart, actualValues.timeEnd);
    }

    console.log("isDurationValueValid", isDurationValueValid);

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
      },
      lastCorrectedValues: {
        timeStart: "10 : 00",
        timeEnd: "19 : 00",
      },
      errors: {},
    }),

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

    if (!validator) return null;

    if (Array.isArray(value)) {
      const result = (validator as (value: string[]) => string | undefined)(value);
      setError(name, result);
    } else {
      const result = (validator as (value: string) => string | undefined)(value as string);
      setError(name, result);
    }
    return;
  },
}));
