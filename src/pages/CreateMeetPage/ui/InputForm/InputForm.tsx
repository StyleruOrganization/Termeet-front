import { Input, type IInputProps } from "@shared/ui";
import { type CreateMeetFields, useCreateMeetStore } from "../../model";

export const InputForm = ({ name, ...props }: IInputProps & { name: CreateMeetFields }) => {
  const setValue = useCreateMeetStore(state => state.setValue);
  const validateField = useCreateMeetStore(state => state.validateField);
  const error = useCreateMeetStore(state => state.errors[name]);
  const clearError = useCreateMeetStore(state => state.clearError);

  const inputValue = useCreateMeetStore(state => state.values[name]);
  return (
    <Input
      {...props}
      error={error}
      name={name}
      autoComplete='off'
      autoCorrect='off'
      autoCapitalize='off'
      spellCheck='false'
      onChange={event => {
        setValue(name, event.target.value);
        if (error) {
          validateField(name);
        }
      }}
      onFocus={() => {
        clearError(name);
      }}
      onBlur={() => {
        validateField(name);
      }}
      value={inputValue}
    />
  );
};
