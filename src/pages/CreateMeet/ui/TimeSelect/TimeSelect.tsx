import { Select as SelectBase } from "@shared/ui";
import { type TimeSelectProps } from "./TimeSelect.types";
import { useCreateMeetStore } from "../../model";

export const TimeSelect = ({ name, ...props }: TimeSelectProps) => {
  const inputValue = useCreateMeetStore(state => state.values[name]);
  const setTime = useCreateMeetStore(state => state.setTime);
  const blurTimeField = useCreateMeetStore(state => state.blurTimeField);
  return (
    <SelectBase
      onFocus={() => {
        if (name == "timeDuration") {
          setTime("timeDuration", " час", false);
        }
        setTime(name, "", false);
      }}
      onChange={(option: string) => {
        setTime(name, option);
      }}
      onBlur={() => {
        blurTimeField(name);
      }}
      initialValue={inputValue}
      name={name}
      {...props}
    />
  );
};
