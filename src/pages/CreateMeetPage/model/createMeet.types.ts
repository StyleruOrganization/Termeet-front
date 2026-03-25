export type ICreateMeet = {
  title: string;
  timeStart: string;
  timeEnd: string;
  dates: string[];
  description?: string;
  link?: string;
  timeDuration?: string;
};

export interface MeetingFormState {
  values: ICreateMeet;
  errors: {
    [key in keyof ICreateMeet]?: string;
  };

  // Для случая если пользователь введет ручками хуйню
  lastCorrectedValues: {
    timeStart?: string;
    timeEnd?: string;
    timeDuration?: string;
  };
  setValue: (name: keyof ICreateMeet, value: string | string[]) => void;
  setError: (name: keyof ICreateMeet, error: string | undefined) => void;
  resetForm: () => void;
  clearErrors: () => void;
  clearError: (name: keyof ICreateMeet) => void;
  setTime: (name: "timeStart" | "timeEnd" | "timeDuration", value: string, isSaveAsLast?: boolean) => void;
  blurTimeField: (name: "timeStart" | "timeEnd" | "timeDuration") => void;
  /** Валидирует поле ввода и ошибку выставляет сразу в поле нужное в объекте errors */
  validateField: (name: keyof ICreateMeet) => void;
}

export type CreateMeetFields = keyof ICreateMeet;
