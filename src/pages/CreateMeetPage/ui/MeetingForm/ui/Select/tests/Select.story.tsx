import { FormProvider, useForm } from "react-hook-form";
import { Select } from "../Select";
import type { ICreateMeet } from "../../../../../model";
import type { TimeSelectProps } from "../Select.types";

// Обертка для компонента с react-hook-form
export const SelectWithForm = ({
  name = "time.start",
  label = "Время начала",
  placeholder = "Выберите время начала",
  error,
  options = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
}: Partial<TimeSelectProps>) => {
  const methods = useForm<ICreateMeet>();

  return (
    <div style={{ padding: "10px" }}>
      <FormProvider {...methods}>
        <Select
          label={label}
          name={name}
          placeholder={placeholder}
          error={error}
          options={options}
          formatValue={(value: string) => ({ value, isValid: true })}
        />
      </FormProvider>
    </div>
  );
};
