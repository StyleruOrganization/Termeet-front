import type { InputHTMLAttributes } from "react";

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
  /** Ненавязывающее сообщение о заполении поля ввода */
  suggestMessage?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
