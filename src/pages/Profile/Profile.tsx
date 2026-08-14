import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  resendVerificationRequest,
  resetPasswordRequest,
  useSessionStore,
  fillWeekWithInterval,
  formatAvailabilitySummary,
  hasAvailability,
  type IAvailabilityInterval,
  type IUser,
} from "@/entities/User";
import { useToastStore } from "@/features/ToastContainer";
import { useTheme } from "@/shared/libs";
import { Container, Input, ModalWrapper, Select } from "@/shared/ui";
import { FeedbackForm } from "@/widgets/FeedbackForm";
import Arrow from "@assets/icons/arrow.svg";
import styles from "./Profile.module.css";
import { TemplateWeekModal } from "./ui/TemplateWeekModal/TemplateWeekModal";

type ProfileTab = "profile" | "notifications" | "integrations" | "appearance" | "support";

const TABS: { id: ProfileTab; label: string }[] = [
  { id: "profile", label: "Профиль" },
  { id: "notifications", label: "Уведомления" },
  { id: "integrations", label: "Интеграции" },
  { id: "appearance", label: "Оформление" },
  { id: "support", label: "Тех поддержка" },
];

const TIMEZONES = [
  "UTC +2:00 (Калининград)",
  "UTC +3:00 (Москва)",
  "UTC +4:00 (Самара)",
  "UTC +5:00 (Екатеринбург)",
  "UTC +6:00 (Омск)",
  "UTC +7:00 (Красноярск)",
  "UTC +8:00 (Иркутск)",
  "UTC +9:00 (Якутск)",
  "UTC +10:00 (Владивосток)",
  "UTC +11:00 (Магадан)",
  "UTC +12:00 (Камчатка)",
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2)
    .toString()
    .padStart(2, "0");
  const minutes = index % 2 === 0 ? "00" : "30";
  return `${hours}:${minutes}`;
});
const END_TIME_OPTIONS = [...TIME_OPTIONS.slice(1), "24:00"];
const LANGUAGE_KEY = "termeet.language";

export const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSessionStore(state => state.user);
  const status = useSessionStore(state => state.status);
  const tab = (searchParams.get("tab") as ProfileTab) || "profile";

  useEffect(() => {
    if (status === "anonymous") {
      navigate("/", { replace: true });
    }
  }, [navigate, status]);

  if (!user) {
    return null;
  }

  const setTab = (next: ProfileTab) => {
    setSearchParams(next === "profile" ? {} : { tab: next }, { replace: true });
  };

  return (
    <Container>
      <button type='button' className={styles.Profile__Back} onClick={() => navigate("/")}>
        <Arrow className={styles.Profile__BackIcon} />
        Личный кабинет
      </button>
      <div className={styles.Profile}>
        <nav className={styles.Profile__Nav} aria-label='Разделы кабинета'>
          {TABS.map(item => (
            <button
              key={item.id}
              type='button'
              className={`${styles.Profile__NavItem} ${tab === item.id ? styles.Profile__NavItem_active : ""}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className={styles.Profile__Content}>
          {tab === "profile" ? <ProfileSettings user={user} onOpenSupport={() => setTab("support")} /> : null}
          {tab === "notifications" ? <Placeholder title='Раздел уведомлений уже в разработке!' /> : null}
          {tab === "integrations" ? <Placeholder title='Раздел интеграций уже в разработке!' /> : null}
          {tab === "appearance" ? <AppearanceSettings /> : null}
          {tab === "support" ? <FeedbackForm /> : null}
        </div>
      </div>
    </Container>
  );
};

const ProfileSettings = ({ user, onOpenSupport }: { user: IUser; onOpenSupport: () => void }) => {
  const navigate = useNavigate();
  const logout = useSessionStore(state => state.logout);
  const updateSettings = useSessionStore(state => state.updateSettings);
  const addToast = useToastStore(state => state.addToast);
  const [timezone, setTimezone] = useState(user.timezone || "UTC +3:00 (Москва)");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"reason" | "confirm">("reason");

  return (
    <div className={styles.Profile__Stack}>
      <section>
        <h2 className={styles.Profile__SectionTitle}>Имя</h2>
        <Input name='first_name' value={user.first_name} readOnly />
        <div className={styles.Profile__FieldGap} />
        <Input name='last_name' value={user.last_name} readOnly />
      </section>
      <section>
        <h2 className={styles.Profile__SectionTitle}>Безопасность и вход</h2>
        <Input
          name='email'
          value={user.email}
          readOnly
          error={user.is_verified ? undefined : "Требуется подтверждение почты"}
        />
        {!user.is_verified ? (
          <button
            type='button'
            className={styles.Profile__LinkButton}
            onClick={async () => {
              try {
                await resendVerificationRequest();
                addToast({
                  id: "verify-resent",
                  type: "success",
                  message: "Письмо с подтверждением отправлено ещё раз",
                });
              } catch {
                addToast({
                  id: "verify-resent-error",
                  type: "error",
                  message: "Не получилось отправить письмо. Проверьте почту через пару минут",
                });
              }
            }}
          >
            Отправить письмо ещё раз
          </button>
        ) : null}
        <button
          type='button'
          className={styles.Profile__Row}
          onClick={async () => {
            try {
              await resetPasswordRequest(user.email);
              addToast({
                id: "reset-sent",
                type: "success",
                message: "Ссылка для смены пароля ушла на почту",
              });
            } catch {
              addToast({
                id: "reset-sent-error",
                type: "error",
                message: "Не получилось отправить письмо для смены пароля",
              });
            }
          }}
        >
          <span>Пароль</span>
          <Arrow className={styles.Profile__RowArrow} />
        </button>
      </section>
      <section>
        <h2 className={styles.Profile__SectionTitle}>Часовой пояс</h2>
        <Select
          name='timezone'
          options={TIMEZONES}
          value={timezone}
          onChange={async value => {
            setTimezone(value);
            try {
              await updateSettings({ timezone: value });
              addToast({ id: "tz-saved", type: "success", message: "Часовой пояс сохранён в аккаунте" });
            } catch {
              addToast({
                id: "tz-saved-error",
                type: "error",
                message: "Не получилось сохранить пояс на сервере. Попробуйте ещё раз",
              });
            }
          }}
        />
      </section>
      <AvailabilityTemplateSettings user={user} />
      <section>
        <h2 className={styles.Profile__SectionTitle}>Удаление аккаунта</h2>
        <button
          type='button'
          className={styles.Profile__Row}
          onClick={() => {
            setDeleteStep("reason");
            setDeleteOpen(true);
          }}
        >
          <span>Ваши встречи будут удалены навсегда</span>
          <Arrow className={styles.Profile__RowArrow} />
        </button>
      </section>
      <button
        type='button'
        className='baseButton secondaryButton'
        onClick={async () => {
          await logout();
          addToast({ id: "logout-success", type: "info", message: "Вы вышли из аккаунта" });
          navigate("/");
        }}
      >
        Выйти из аккаунта
      </button>
      <ModalWrapper isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} isAnimate>
        {deleteStep === "reason" ? (
          <div className={styles.Profile__Modal}>
            <h2>Уточните причину</h2>
            <p>Возможно мы сможем помочь — и профиль не придётся удалять</p>
            <button type='button' className={styles.Profile__Row} onClick={() => setDeleteStep("confirm")}>
              Слишком много уведомлений
              <Arrow className={styles.Profile__RowArrow} />
            </button>
            <button type='button' className={styles.Profile__Row} onClick={() => setDeleteStep("confirm")}>
              Мои друзья не пользуются Termeet
              <Arrow className={styles.Profile__RowArrow} />
            </button>
            <button type='button' className={styles.Profile__Row} onClick={() => setDeleteStep("confirm")}>
              Не разобрался
              <Arrow className={styles.Profile__RowArrow} />
            </button>
            <button type='button' className={styles.Profile__Row} onClick={() => setDeleteStep("confirm")}>
              Я нашёл другое приложение
              <Arrow className={styles.Profile__RowArrow} />
            </button>
            <button type='button' className='baseButton mainButton' onClick={() => setDeleteOpen(false)}>
              Закрыть
            </button>
          </div>
        ) : (
          <div className={styles.Profile__Modal}>
            <h2>Удаление аккаунта</h2>
            <p>Удаление аккаунта пока нельзя сделать из кабинета. Напишите в техподдержку, если это правда нужно.</p>
            <button
              type='button'
              className='baseButton mainButton'
              onClick={() => {
                setDeleteOpen(false);
                onOpenSupport();
              }}
            >
              Написать в поддержку
            </button>
            <button
              type='button'
              className='baseButton outlineButton'
              onClick={() => {
                addToast({
                  id: "delete-unavailable",
                  type: "info",
                  message: "Удаление аккаунта ещё не подключено на сервере",
                });
              }}
            >
              Удалить аккаунт
            </button>
          </div>
        )}
      </ModalWrapper>
    </div>
  );
};

const AvailabilityTemplateSettings = ({ user }: { user: IUser }) => {
  const updateSettings = useSessionStore(state => state.updateSettings);
  const addToast = useToastStore(state => state.addToast);
  const savedTemplate = user.availability_template ?? [];
  const [quickStart, setQuickStart] = useState("09:00");
  const [quickEnd, setQuickEnd] = useState("18:00");
  const [weekOpen, setWeekOpen] = useState(false);
  const suggestPrefill = user.suggest_prefill !== false;
  const summary = formatAvailabilitySummary(savedTemplate);

  const saveTemplate = async (next: IAvailabilityInterval[]) => {
    try {
      await updateSettings({ availability_template: next });
      addToast({ id: "template-saved", type: "success", message: "Шаблон времени сохранён в аккаунте" });
    } catch {
      addToast({
        id: "template-saved-error",
        type: "error",
        message: "Не получилось сохранить шаблон. Попробуйте ещё раз",
      });
    }
  };

  return (
    <section>
      <h2 className={styles.Profile__SectionTitle}>Обычное время</h2>
      <p className={styles.Profile__Hint}>
        Можно быстро закрасить все дни одним интервалом и потом поправить календарь недели: в понедельник одно время, в
        субботу другое.
      </p>
      <div className={styles.Profile__Interval}>
        <Select
          name='template-start'
          className={styles.Profile__IntervalSelect}
          options={TIME_OPTIONS}
          value={quickStart}
          disabledFunc={value => value >= quickEnd}
          onChange={setQuickStart}
        />
        <Select
          name='template-end'
          className={styles.Profile__IntervalSelect}
          options={END_TIME_OPTIONS}
          value={quickEnd}
          disabledFunc={value => value <= quickStart}
          onChange={setQuickEnd}
        />
      </div>
      <button
        type='button'
        className={`baseButton mainButton ${styles.Profile__SaveTemplate}`}
        onClick={() => saveTemplate(fillWeekWithInterval(quickStart, quickEnd))}
      >
        Заполнить все дни
      </button>
      <button type='button' className={styles.Profile__LinkButton} onClick={() => setWeekOpen(true)}>
        Открыть календарь недели
      </button>
      {summary ? <p className={styles.Profile__Hint}>Сейчас: {summary}</p> : null}
      {hasAvailability(savedTemplate) ? (
        <button type='button' className={styles.Profile__LinkButton} onClick={() => saveTemplate([])}>
          Очистить шаблон
        </button>
      ) : null}
      <label className={styles.Profile__ToggleRow}>
        <span>Предлагать предзаполнение на встрече</span>
        <button
          type='button'
          role='switch'
          aria-checked={suggestPrefill}
          className={`${styles.Profile__Switch} ${suggestPrefill ? styles.Profile__Switch_on : ""}`}
          onClick={async () => {
            try {
              await updateSettings({ suggest_prefill: !suggestPrefill });
            } catch {
              addToast({
                id: "prefill-toggle-error",
                type: "error",
                message: "Не получилось сохранить настройку",
              });
            }
          }}
        />
      </label>
      <TemplateWeekModal
        isOpen={weekOpen}
        intervals={savedTemplate}
        onClose={() => setWeekOpen(false)}
        onSave={saveTemplate}
      />
    </section>
  );
};

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  const userTheme = useSessionStore(state => state.user?.theme);
  const updateSettings = useSessionStore(state => state.updateSettings);
  const addToast = useToastStore(state => state.addToast);
  const [language, setLanguage] = useState(() => localStorage.getItem(LANGUAGE_KEY) || "Русский");
  const currentTheme = userTheme ?? theme;

  return (
    <div className={styles.Profile__Stack}>
      <label className={styles.Profile__ToggleRow}>
        <span>Светлая тема</span>
        <button
          type='button'
          role='switch'
          aria-checked={currentTheme === "light"}
          className={`${styles.Profile__Switch} ${currentTheme === "light" ? styles.Profile__Switch_on : ""}`}
          onClick={async () => {
            const next = currentTheme === "light" ? "dark" : "light";
            setTheme(next);
            try {
              await updateSettings({ theme: next });
            } catch {
              addToast({
                id: "theme-saved-error",
                type: "error",
                message: "Тема сменилась на этом устройстве, но на сервер не ушла",
              });
            }
          }}
        />
      </label>
      <section>
        <h2 className={styles.Profile__SectionTitle}>Язык</h2>
        <Select
          name='language'
          options={["Русский", "English", "Deutsch"]}
          value={language}
          onChange={value => {
            setLanguage(value);
            localStorage.setItem(LANGUAGE_KEY, value);
            if (value !== "Русский") {
              addToast({
                id: "lang-soon",
                type: "info",
                message: "Пока интерфейс только на русском. Запомнили выбор на этом устройстве",
              });
            }
          }}
        />
      </section>
      <button
        type='button'
        className={styles.Profile__Row}
        onClick={() =>
          addToast({
            id: "tester-soon",
            type: "info",
            message: "Набор тестеров ещё не открыт. Напишите в техподдержку, если хотите помочь",
          })
        }
      >
        Стать тестером
        <Arrow className={styles.Profile__RowArrow} />
      </button>
    </div>
  );
};

const Placeholder = ({ title }: { title: string }) => {
  return (
    <div className={styles.Profile__Placeholder}>
      <div className={styles.Profile__Puzzle} aria-hidden />
      <p>{title}</p>
    </div>
  );
};
