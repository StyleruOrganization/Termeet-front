import { type FormEvent, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { resetPasswordVerifyRequest, useSessionStore } from "@/entities/User";
import { HttpError } from "@/shared/api";
import { Input } from "@/shared/ui";
import TermeetLogo from "@assets/icons/logo.svg";
import { useToastStore } from "@features/ToastContainer";
import styles from "./AuthReset.module.css";

type FieldName = "password" | "passwordRepeat";
type FieldErrors = Partial<Record<FieldName, string>>;

export const AuthReset = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const applyAccessToken = useSessionStore(state => state.applyAccessToken);
  const addToast = useToastStore(state => state.addToast);

  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const values = { password, passwordRepeat };

  const getFieldError = (name: FieldName, nextValues = values): string | undefined => {
    if (name === "password" && nextValues.password.length < 6) {
      return "Пароль не короче 6 символов";
    }
    if (name === "passwordRepeat" && nextValues.password !== nextValues.passwordRepeat) {
      return "Пароли не совпадают";
    }
    return undefined;
  };

  const clearError = (name: FieldName) => {
    setFormError("");
    setFieldErrors(prev => {
      if (!prev[name]) {
        return prev;
      }
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const validateField = (name: FieldName, nextValues = values) => {
    const error = getFieldError(name, nextValues);
    setFieldErrors(prev => {
      if (!error && !prev[name]) {
        return prev;
      }
      const next = { ...prev };
      if (error) {
        next[name] = error;
      } else {
        delete next[name];
      }
      return next;
    });
  };

  const bindField = (name: FieldName) => ({
    error: fieldErrors[name],
    onFocus: () => {
      clearError(name);
    },
    onBlur: () => {
      validateField(name);
    },
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    const nextErrors: FieldErrors = {};
    (["password", "passwordRepeat"] as FieldName[]).forEach(name => {
      const error = getFieldError(name);
      if (error) {
        nextErrors[name] = error;
      }
    });
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || isPending) {
      return;
    }

    if (!token) {
      addToast({
        id: "reset-password-error",
        type: "error",
        message: "Не хватает ссылки для сброса пароля",
      });
      navigate("/", { replace: true });
      return;
    }

    setIsPending(true);
    try {
      const tokens = await resetPasswordVerifyRequest(token, password);
      if (tokens.access_token) {
        await applyAccessToken(tokens.access_token);
      }
      addToast({
        id: "reset-password-success",
        type: "success",
        message: "Пароль обновлён",
      });
      navigate("/", { replace: true });
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) {
        setFormError("Ссылка недействительна или устарела");
        return;
      }
      setFormError("Не получилось обновить пароль. Попробуйте ещё раз");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={styles.AuthReset}>
      <div className={styles.AuthReset__Logo}>
        <TermeetLogo />
        termeet
      </div>
      <form className={styles.AuthReset__Form} onSubmit={handleSubmit}>
        <p className={styles.AuthReset__Hint}>Придумайте новый пароль</p>
        <div className={styles.AuthReset__Fields}>
          <Input
            name='password'
            type='password'
            autoComplete='new-password'
            label='Новый пароль'
            placeholder='Ваш пароль'
            value={password}
            onChange={event => {
              const nextPassword = event.target.value;
              setPassword(nextPassword);
              if (fieldErrors.password) {
                validateField("password", { ...values, password: nextPassword });
              }
            }}
            {...bindField("password")}
          />
          <Input
            name='passwordRepeat'
            type='password'
            autoComplete='new-password'
            label='Повторите пароль'
            placeholder='Ваш пароль'
            value={passwordRepeat}
            onChange={event => {
              const nextPasswordRepeat = event.target.value;
              setPasswordRepeat(nextPasswordRepeat);
              if (fieldErrors.passwordRepeat) {
                validateField("passwordRepeat", { ...values, passwordRepeat: nextPasswordRepeat });
              }
            }}
            {...bindField("passwordRepeat")}
          />
        </div>
        {formError && <span className={styles.AuthReset__Error}>{formError}</span>}
        <button className='baseButton mainButton' type='submit' disabled={isPending}>
          Сохранить пароль
        </button>
      </form>
    </div>
  );
};
