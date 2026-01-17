import type { MeetingKeys } from "@/shared/types/CreateMeeting.types";

export interface InputProps {
  /** Имя поля ввода */
  name: MeetingKeys;
  /** Заголовок поля ввода */
  label: string;
  placeholder: string;
  /** Флаг, указывающий, должно ли поле быть только для чтения */
  readOnly?: boolean;
  /** Сообщение об ошибке */
  error?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
