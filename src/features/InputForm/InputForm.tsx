import { useFormContext } from "react-hook-form";
import { Input, type IInputProps } from "@shared/ui";

export const InputForm = ({ name, onChange: onChangeExternal, ...props }: IInputProps) => {
  const { register } = useFormContext();
  const { onChange: onChangeRegister, ...inputProps } = register(name);

  return (
    <Input
      {...props}
      {...inputProps}
      name={name}
      onChange={event => {
        onChangeRegister?.(event);
        onChangeExternal?.(event);
      }}
    />
  );
};
