import { useState } from "react";
import { Toggle, Input } from "@/shared/ui";
import TermeetLogo from "@assets/icons/logo.svg";
import YandexLogo from "@assets/icons/YandexID.svg";
import styles from "./LoginForm.module.css";

export const LoginForm = () => {
  const [view, setView] = useState<"login" | "register">("register");
  return (
    <form className={styles.LoginForm}>
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
            if (value === "left") {
              setView("register");
            } else {
              setView("login");
            }
          }}
        />

        <div className={styles.LoginForm__FL16}>
          <Input name='email' placeholder='example@email.com' label='Логин или почта' />
          <Input name='password' label='Пароль' placeholder='Ваш пароль' />
          {view === "register" && <Input name='password' label='Повторите пароль' placeholder='Ваш пароль' />}
        </div>
        {view == "register" && (
          <>
            <div className={styles.LoginForm__Devider} />
            <div className={styles.LoginForm__FL16}>
              <Input name='name' label='Имя' placeholder='Ламин' />
              <Input name='surname' label='Фамилия' placeholder='Ямаль' />
            </div>
          </>
        )}

        <div className={styles.LoginForm__FL16}>
          <button className='baseButton mainButton'>{view === "register" ? "Зарегистрироваться" : "Войти"}</button>
          <button className='baseButton outlineButton'>
            <YandexLogo />
            <span>Войти с помощью Яндекс</span>
          </button>
        </div>
      </div>
    </form>
  );
};
