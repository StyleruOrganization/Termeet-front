import { type FormEvent, useState } from "react";
import { loginRequest, registerRequest, useSessionStore } from "@/entities/User";
import { HttpError } from "@/shared/api";
import { useLoginModalStore } from "@/shared/libs";
import { Input, Toggle } from "@/shared/ui";
import TermeetLogo from "@assets/icons/logo.svg";
import YandexLogo from "@assets/icons/YandexID.svg";
import { useToastStore } from "@features/ToastContainer";
import styles from "./LoginForm.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [view, setView] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    passwordRepeat?: string;
    firstName?: string;
    lastName?: string;
  }>({});
  const [isPending, setIsPending] = useState(false);

  const applyAccessToken = useSessionStore(state => state.applyAccessToken);
  const close = useLoginModalStore(state => state.close);
  const addToast = useToastStore(state => state.addToast);

  const validate = () => {
    const nextErrors: typeof fieldErrors = {};

    if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Введите корректный email";
    }
    if (password.length < 6) {
      nextErrors.password = "Пароль не короче 6 символов";
    }
    if (view === "register") {
      if (!firstName.trim()) {
        nextErrors.firstName = "Укажите имя";
      }
      if (!lastName.trim()) {
        nextErrors.lastName = "Укажите фамилию";
      }
      if (password !== passwordRepeat) {
        nextErrors.passwordRepeat = "Пароли не совпадают";
      }
    }

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
    if (!validate() || isPending) {
      return;
    }

    setIsPending(true);
    try {
      if (view === "register") {
        await registerRequest({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password,
          do_verify_email: true,
        });
        const tokens = await loginRequest({ email: email.trim(), password });
        await finishAuth(tokens.access_token, "Аккаунт создан. Проверьте почту для подтверждения");
        return;
      }

      const tokens = await loginRequest({ email: email.trim(), password });
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

  return (
    <form className={styles.LoginForm} onSubmit={handleSubmit}>
      <div className={styles.LoginForm__Logo}>
        <TermeetLogo />
        termeet
      </div>
      <div className={styles.LoginForm__Wrapper}>
        <Toggle
          className={styles.LoginForm__Toggle}
          classNameOption={styles.LoginForm__Toggle__Option}
          classNameActive={styles.LoginForm__Toggle__Option__Active}
          RightLabel='Войти'
          LeftLabel='Зарегистрироваться'
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
            error={fieldErrors.email}
            onChange={event => setEmail(event.target.value)}
          />
          <Input
            name='password'
            type='password'
            autoComplete={view === "register" ? "new-password" : "current-password"}
            label='Пароль'
            placeholder='Ваш пароль'
            value={password}
            error={fieldErrors.password}
            onChange={event => setPassword(event.target.value)}
          />
          {view === "register" && (
            <Input
              name='passwordRepeat'
              type='password'
              autoComplete='new-password'
              label='Повторите пароль'
              placeholder='Ваш пароль'
              value={passwordRepeat}
              error={fieldErrors.passwordRepeat}
              onChange={event => setPasswordRepeat(event.target.value)}
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
                error={fieldErrors.firstName}
                onChange={event => setFirstName(event.target.value)}
              />
              <Input
                name='lastName'
                label='Фамилия'
                placeholder='Ямаль'
                autoComplete='family-name'
                value={lastName}
                error={fieldErrors.lastName}
                onChange={event => setLastName(event.target.value)}
              />
            </div>
          </>
        )}

        {formError && <span className={styles.LoginForm__Error}>{formError}</span>}

        <div className={styles.LoginForm__FL16}>
          <button className='baseButton mainButton' type='submit' disabled={isPending}>
            {view === "register" ? "Зарегистрироваться" : "Войти"}
          </button>
          <button className='baseButton outlineButton' type='button' onClick={handleYandexLogin} disabled={isPending}>
            <YandexLogo />
            <span>Войти с помощью Яндекс</span>
          </button>
        </div>
      </div>
    </form>
  );
};
