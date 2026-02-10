import { Input } from "../Input";
import type { InputProps } from "../Input.types";

// Обертка для компонента с react-hook-form
export const InputStory = ({
  name = "title",
  label = "Название встречи",
  placeholder = "Введите название встречи",
  error,
}: Partial<InputProps>) => {
  return (
    <div style={{ padding: "10px" }}>
      <Input label={label} name={name} placeholder={placeholder} error={error} />
    </div>
  );
};
