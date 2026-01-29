import { FormProvider, useForm } from "react-hook-form";
import { Input } from "../Input";
import type { InputProps } from "../Input.types";

// Обертка для компонента с react-hook-form
export const InputWithForm = ({
  name = "title",
  label = "Название встречи",
  placeholder = "Введите название встречи",
  error,
}: Partial<InputProps>) => {
  const methods = useForm({
    defaultValues: {
      [name]: "",
    },
  });

  return (
    <div style={{ padding: "10px" }}>
      <FormProvider {...methods}>
        <Input label={label} name={name} placeholder={placeholder} error={error} />
      </FormProvider>
    </div>
  );
};
