import type { MeetingKeys } from "@/shared/types/CreateMeeting.types";

export interface TimeSelectProps {
  /** Заголовок поля ввода */
  label: string;
  placeholder: string;
  /** Варинаты которые можно выбрать */
  options: string[];
  /** Сообщение об ошибке извне */
  error?: string;
  /** Текущее значение */
  name: MeetingKeys;
  readonly?: boolean;
  onItemClick?: (value: string) => void;
  formatValue: (value: string) => { isValid: boolean; value: string };
}
