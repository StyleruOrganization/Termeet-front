import { create } from "zustand";
import { formatTime, isDurationValid } from "../lib/formatting/timeFormatters";
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
        values: { ...state.values, [name]: value || state.lastCorrectedValues[name] },
        lastCorrectedValues: isSaveAsLast
          ? {
              ...state.lastCorrectedValues,
              [name]: value.length ? value : state.lastCorrectedValues[name],
            }
          : { ...state.lastCorrectedValues },
      }));
      return;
    }
    const resultValidation = formatTime(value);
    const times = {
      timeStart: get().values.timeStart,
      timeEnd: get().values.timeEnd,
    };

    if (resultValidation.isValid) {
      times[name] = resultValidation.value;
    }

    const durationValue = get().values.timeDuration;
    let isDurationValueValid = true;

    if (durationValue) {
      isDurationValueValid = isDurationValid(durationValue, times["timeStart"], times["timeEnd"]);
    }

    set(state => ({
      values: {
        ...state.values,
        [name]: resultValidation.value,
        ["timeDuration"]: !isDurationValueValid ? "" : state.values.timeDuration,
      },
      lastCorrectedValues: isSaveAsLast
        ? {
            ...state.lastCorrectedValues,
            [name]: resultValidation.isValid ? resultValidation.value : state.lastCorrectedValues[name],
            ["timeDuration"]: !isDurationValueValid ? "" : state.lastCorrectedValues.timeDuration,
          }
        : { ...state.lastCorrectedValues },
      errors: { ...state.errors, [name]: !resultValidation.isValid ? "Ошибочка имеется со временем" : undefined },
    }));
  },

  blurTimeField: name => {
    const lastCorrectedTime = get().lastCorrectedValues[name];
    if (lastCorrectedTime == undefined) return;

    const roundToHalfHour = (time: string): string => {
      const [hours, minutes] = time.split(":").map(Number);

      let newHours = hours;
      let newMinutes: number;

      if (minutes < 15) {
        newMinutes = 0;
      } else if (minutes < 30) {
        newMinutes = 15;
      } else if (minutes < 45) {
        newMinutes = 30;
      } else if (minutes < 60) {
        newMinutes = 45;
      } else {
        newMinutes = 0;
        newHours = (hours + 1) % 24;
      }

      return `${String(newHours).padStart(2, "0")} : ${String(newMinutes).padStart(2, "0")}`;
    };

    set(state => ({
      values: {
        ...state.values,
        [name]: name != "timeDuration" ? roundToHalfHour(lastCorrectedTime) : lastCorrectedTime,
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
