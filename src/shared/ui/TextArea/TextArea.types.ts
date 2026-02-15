import type { TextareaHTMLAttributes } from "react";

export interface ITextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  /** Заголовок поля ввода */
  label?: string;
  placeholder?: string;
  /** Обязательно ли поле для заполнения */
  required?: boolean;
  /** Сообщение об ошибке */
  error?: string;
}
