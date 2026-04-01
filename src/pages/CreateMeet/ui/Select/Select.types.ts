import type { CreateMeetFields } from "../../model";

export interface TimeSelectProps {
  name: Extract<CreateMeetFields, "timeStart" | "timeEnd" | "timeDuration">;
  disabledFunc: (value: string) => boolean;
  /** Заголовок поля ввода */
  label?: string;
  placeholder: string;
  /** Варинаты которые можно выбрать */
  options: string[];
  className?: string;
}
