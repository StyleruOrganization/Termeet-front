import { Input } from "../Input";
import type { IInputProps } from "../Input.types";

export const InputStory = ({
  name = "title",
  label = "Название встречи",
  placeholder = "Введите название встречи",
  error,
}: Partial<IInputProps>) => {
  return (
    <div style={{ padding: "10px" }}>
      <Input label={label} name={name} placeholder={placeholder} error={error} />
    </div>
  );
};
