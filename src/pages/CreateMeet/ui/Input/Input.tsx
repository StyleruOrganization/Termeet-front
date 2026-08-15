import { Input as InputBase, type IInputProps } from "@shared/ui";
import { type CreateMeetFields, useCreateMeetStore } from "../../model";

type TextMeetField = Exclude<
  CreateMeetFields,
  | "dates"
  | "invitedUsers"
  | "teamId"
  | "isClosed"
  | "inviteOnlyVote"
  | "anyoneCanEdit"
  | "anyoneCanDeleteParticipants"
  | "requireLoginToVote"
  | "anyoneCanSetFinal"
  | "lockVoteAfterDeadline"
  | "remindEnabled"
  | "remindOffsets"
>;

export const Input = ({ name, ...props }: IInputProps & { name: TextMeetField }) => {
  const setValue = useCreateMeetStore(state => state.setValue);
  const validateField = useCreateMeetStore(state => state.validateField);
  const error = useCreateMeetStore(state => state.errors[name]);
  const clearError = useCreateMeetStore(state => state.clearError);

  const inputValue = useCreateMeetStore(state => state.values[name]);
  return (
    <InputBase
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
      value={typeof inputValue === "string" ? inputValue : ""}
    />
  );
};
