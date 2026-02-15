import type { InputHTMLAttributes, RefObject } from "react";

export interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Имя поля ввода */
  name: string;
  /** Заголовок поля ввода */
  label: string;
  placeholder: string;
  /** Флаг, указывающий, должно ли поле быть только для чтения */
  readOnly?: boolean;
  /** Сообщение об ошибке */
  error?: string;
  /** Ref на input (для императивного доступа) */
  inputRef?: RefObject<HTMLInputElement | null>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
