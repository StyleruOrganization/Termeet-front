export interface TimeSelectProps {
  name: string;
  /** Функция для проверки возможности выбора значения */
  disabledFunc?: (value: string) => boolean;
  /** Заголовок поля ввода */
  label?: string;
  placeholder?: string;
  /** Варинаты которые можно выбрать */
  options: string[];

  sizeArrow?: 16 | 8;
  /** Начальное значение (uncontrolled) */
  initialValue?: string;
  /** Контролируемое значение */
  value?: string;
  className?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}
