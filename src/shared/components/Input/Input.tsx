import { type InputHTMLAttributes, forwardRef } from "react";
import { useFormContext } from "react-hook-form";
import { mergeRefs } from "@/shared/utils/mergeRefs";
import { ErrorIcon } from "@assets/icons";
import styles from "./Input.module.css";

export interface IInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  placeholder?: string;
  name: string;
  error?: string;
  readOnly?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = forwardRef<HTMLInputElement, IInputProps>(
  ({ label, placeholder, name, error, onChange, readOnly = false, inputRef, className = "", ...props }, ref) => {
    return (
      <div className={`${styles.Input} ${error ? styles.Input__Error : ""}`}>
        {label && (
          <label className={styles.Input__Label} htmlFor={name}>
            {label}
          </label>
        )}
        <input
          {...props}
          ref={mergeRefs(ref, inputRef)}
          onChange={onChange}
          id={name}
          name={name}
          readOnly={readOnly}
          placeholder={placeholder}
          className={`${styles.Input__Field} ${className}`}
        />
        {error && (
          <div data-test-id='error-field' className={styles.Input__ErrorField}>
            <ErrorIcon />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  },
);

// Пусть пока обертка тоже здесь полежит, не хочу отдельный компонент делать для этого(А используется в Select и MeetingForm)
export const FormInput = ({ name, onChange: onChangeExternal, ...props }: IInputProps) => {
  const { register } = useFormContext();
  const { onChange: onChangeRegister, ref, ...inputProps } = register(name);

  return (
    <Input
      {...props}
      {...inputProps}
      name={name}
      ref={ref}
      onChange={event => {
        onChangeRegister?.(event);
        onChangeExternal?.(event);
      }}
    />
  );
};
