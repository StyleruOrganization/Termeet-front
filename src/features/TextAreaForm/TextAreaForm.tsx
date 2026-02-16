import { useFormContext } from "react-hook-form";
import { TextArea, type ITextAreaProps } from "@shared/ui";

export const TextAreaForm = ({ name, ...textAreaProps }: ITextAreaProps) => {
  const { register } = useFormContext();
  return <TextArea {...textAreaProps} {...register(name)} />;
};
