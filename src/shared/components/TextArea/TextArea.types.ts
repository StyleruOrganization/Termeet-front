import type { MeetingKeys } from "@/shared/types/CreateMeeting.types";

export interface TextAreaProps {
  name: MeetingKeys;
  /** Заголовок поля ввода */
  label?: string;
  placeholder?: string;
  /** Обязательно ли поле для заполнения */
  required?: boolean;
  /** Сообщение об ошибке */
  error?: string;
}
