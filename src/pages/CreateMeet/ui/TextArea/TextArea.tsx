import { TextArea as TextAreaBase, type ITextAreaProps } from "@shared/ui";
import { type CreateMeetFields, useCreateMeetStore } from "../../model";

export const TextArea = ({ name, ...textAreaProps }: ITextAreaProps & { name: CreateMeetFields }) => {
  const setValue = useCreateMeetStore(state => state.setValue);
  const validateField = useCreateMeetStore(state => state.validateField);
  const error = useCreateMeetStore(state => state.errors[name]);
  const clearError = useCreateMeetStore(state => state.clearError);

  const textAreaValue = useCreateMeetStore(state => state.values[name]);
  return (
    <TextAreaBase
      {...textAreaProps}
      error={error}
      name={name}
      value={textAreaValue}
      onChange={event => {
        setValue(name, event.target.value);
      }}
      onFocus={() => {
        clearError(name);
      }}
      onBlur={() => {
        validateField(name);
      }}
    />
  );
};
