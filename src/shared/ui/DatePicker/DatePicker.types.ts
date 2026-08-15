export interface DatePickerProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  /** Повторный клик по выбранному дню очищает поле */
  allowEmpty?: boolean;
  onBlur?: () => void;
}
