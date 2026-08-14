import { type FormEvent, useState } from "react";
import { loginRequest, registerRequest, resetPasswordRequest, useSessionStore } from "@/entities/User";
import { HttpError } from "@/shared/api";
import { useLoginModalStore } from "@/shared/libs";
import { Input, Toggle } from "@/shared/ui";
import TermeetLogo from "@assets/icons/logo.svg";
import YandexLogo from "@assets/icons/YandexID.svg";
import { useToastStore } from "@features/ToastContainer";
import styles from "./LoginForm.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthView = "login" | "register" | "forgot" | "forgotSent";
type FieldName = "email" | "password" | "passwordRepeat" | "firstName" | "lastName";
type FieldErrors = Partial<Record<FieldName, string>>;

const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof HttpError) {
    if (error.status === 401) {
      return "Неверный email или пароль";
    }
    if (error.status === 400) {
      return "Пользователь с такой почтой уже есть";
    }
    if (error.status === 403) {
      return "Аккаунт заблокирован";
    }
    if (error.detail) {
      return error.detail;
    }
  }
  return "Не получилось войти. Попробуйте ещё раз";
};

export const LoginForm = () => {
  const [view, setView] = useState<AuthView>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isPending, setIsPending] = useState(false);

  const applyAccessToken = useSessionStore(state => state.applyAccessToken);
  const close = useLoginModalStore(state => state.close);
  const addToast = useToastStore(state => state.addToast);

  const values = { email, password, passwordRepeat, firstName, lastName };

  const getFieldError = (name: FieldName, nextValues: typeof values = values): string | undefined => {
    if (name === "email" && !EMAIL_REGEX.test(nextValues.email.trim())) {
      return "Введите корректный email";
    }
    if (name === "password" && nextValues.password.length < 6) {
      return "Пароль не короче 6 символов";
    }
    if (view !== "register") {
      return undefined;
    }
    if (name === "firstName" && !nextValues.firstName.trim()) {
      return "Укажите имя";
    }
    if (name === "lastName" && !nextValues.lastName.trim()) {
      return "Укажите фамилию";
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

  const validateField = (name: FieldName, nextValues: typeof values = values) => {
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

  const validate = () => {
    const fields: FieldName[] =
      view === "register"
        ? ["email", "password", "passwordRepeat", "firstName", "lastName"]
        : view === "forgot"
          ? ["email"]
          : ["email", "password"];
    const nextErrors: FieldErrors = {};

    fields.forEach(name => {
      const error = getFieldError(name);
      if (error) {
        nextErrors[name] = error;
      }
    });

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const finishAuth = async (accessToken: string, successMessage: string) => {
    await applyAccessToken(accessToken);
    close();
    addToast({
      id: "auth-success",
      type: "success",
      message: successMessage,
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (!validate() || isPending || view === "forgotSent") {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    setIsPending(true);
    try {
      if (view === "forgot") {
        await resetPasswordRequest(normalizedEmail);
        setView("forgotSent");
        return;
      }

      if (view === "register") {
        const registered = await registerRequest({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: normalizedEmail,
          password,
          do_verify_email: true,
        });
        if ("access_token" in registered && registered.access_token) {
          await finishAuth(registered.access_token, "Аккаунт создан. Проверьте почту для подтверждения");
          return;
        }

        const tokens = await loginRequest({ email: normalizedEmail, password });
        await finishAuth(tokens.access_token, "Аккаунт создан. Проверьте почту для подтверждения");
        return;
      }

      const tokens = await loginRequest({ email: normalizedEmail, password });
      await finishAuth(tokens.access_token, "Вы вошли");
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setIsPending(false);
    }
  };

  const handleYandexLogin = () => {
    window.location.assign("/api/auth/yandex/url");
  };

  const goToLogin = () => {
    setFormError("");
    setFieldErrors({});
    setView("login");
  };

  return (
    <form className={styles.LoginForm} onSubmit={handleSubmit}>
      <div className={styles.LoginForm__Logo}>
        <TermeetLogo />
        termeet
      </div>
      <div className={styles.LoginForm__Wrapper}>
        {view === "forgot" || view === "forgotSent" ? (
          <>
            <p className={styles.LoginForm__Hint}>
              {view === "forgotSent"
                ? "Если аккаунт с этой почтой есть, мы отправили ссылку для нового пароля"
                : "Введите почту — отправим ссылку для нового пароля"}
            </p>
            {view === "forgot" && (
              <div className={styles.LoginForm__FL16}>
                <Input
                  name='email'
                  type='email'
                  autoComplete='email'
                  placeholder='example@email.com'
                  label='Почта'
                  value={email}
                  onChange={event => {
                    const nextEmail = event.target.value;
                    setEmail(nextEmail);
                    if (fieldErrors.email) {
                      validateField("email", { ...values, email: nextEmail });
                    }
                  }}
                  {...bindField("email")}
                />
              </div>
            )}
            {formError && <span className={styles.LoginForm__Error}>{formError}</span>}
            <div className={styles.LoginForm__FL16}>
              {view === "forgot" && (
                <button className='baseButton mainButton' type='submit' disabled={isPending}>
                  Отправить ссылку
                </button>
              )}
              <button className='baseButton outlineButton' type='button' onClick={goToLogin} disabled={isPending}>
                Назад ко входу
              </button>
            </div>
          </>
        ) : (
          <>
            <Toggle
              className={styles.LoginForm__Toggle}
              classNameOption={styles.LoginForm__Toggle__Option}
              classNameActive={styles.LoginForm__Toggle__Option__Active}
              RightLabel='Войти'
              LeftLabel='Зарегистрироваться'
              defaultActive={view === "login" ? "right" : "left"}
              onChange={value => {
                setFormError("");
                setFieldErrors({});
                if (value === "left") {
                  setView("register");
                } else {
                  setView("login");
                }
              }}
            />

            <div className={styles.LoginForm__FL16}>
              <Input
                name='email'
                type='email'
                autoComplete='email'
                placeholder='example@email.com'
                label='Логин или почта'
                value={email}
                onChange={event => {
                  const nextEmail = event.target.value;
                  setEmail(nextEmail);
                  if (fieldErrors.email) {
                    validateField("email", { ...values, email: nextEmail });
                  }
                }}
                {...bindField("email")}
              />
              <Input
                name='password'
                type='password'
                autoComplete={view === "register" ? "new-password" : "current-password"}
                label='Пароль'
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
              {view === "login" && (
                <button
                  className={styles.LoginForm__Forgot}
                  type='button'
                  onClick={() => {
                    setFormError("");
                    setFieldErrors({});
                    setView("forgot");
                  }}
                >
                  Забыли пароль?
                </button>
              )}
              {view === "register" && (
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
              )}
            </div>
            {view === "register" && (
              <>
                <div className={styles.LoginForm__Devider} />
                <div className={styles.LoginForm__FL16}>
                  <Input
                    name='firstName'
                    label='Имя'
                    placeholder='Ламин'
                    autoComplete='given-name'
                    value={firstName}
                    onChange={event => {
                      const nextFirstName = event.target.value;
                      setFirstName(nextFirstName);
                      if (fieldErrors.firstName) {
                        validateField("firstName", { ...values, firstName: nextFirstName });
                      }
                    }}
                    {...bindField("firstName")}
                  />
                  <Input
                    name='lastName'
                    label='Фамилия'
                    placeholder='Ямаль'
                    autoComplete='family-name'
                    value={lastName}
                    onChange={event => {
                      const nextLastName = event.target.value;
                      setLastName(nextLastName);
                      if (fieldErrors.lastName) {
                        validateField("lastName", { ...values, lastName: nextLastName });
                      }
                    }}
                    {...bindField("lastName")}
                  />
                </div>
              </>
            )}

            {formError && <span className={styles.LoginForm__Error}>{formError}</span>}

            <div className={styles.LoginForm__FL16}>
              <button className='baseButton mainButton' type='submit' disabled={isPending}>
                {view === "register" ? "Зарегистрироваться" : "Войти"}
              </button>
              <button
                className='baseButton outlineButton'
                type='button'
                onClick={handleYandexLogin}
                disabled={isPending}
              >
                <YandexLogo />
                <span>Войти с помощью Яндекс</span>
              </button>
            </div>
          </>
        )}
      </div>
    </form>
  );
};
