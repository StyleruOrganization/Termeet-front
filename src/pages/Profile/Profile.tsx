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
import { TIMES } from "@/shared/consts";
import { useTheme } from "@/shared/libs";
import { Container, Input, ModalWrapper, Select } from "@/shared/ui";
import { FeedbackForm } from "@/widgets/FeedbackForm";
import Arrow from "@assets/icons/arrow.svg";
import stubImage from "@assets/img/stub.png";
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
const GRID_WINDOW_KEY = "termeet.gridWindow";

const readGridWindow = () => {
  try {
    const raw = localStorage.getItem(GRID_WINDOW_KEY);
    if (!raw) {
      return { start: "10 : 00", end: "19 : 00" };
    }
    const parsed = JSON.parse(raw) as { start?: string; end?: string };
    return {
      start: parsed.start || "10 : 00",
      end: parsed.end || "19 : 00",
    };
  } catch {
    return { start: "10 : 00", end: "19 : 00" };
  }
};

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
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSending, setPasswordSending] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"warn" | "reason">("warn");

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
        <button type='button' className={styles.Profile__Row} onClick={() => setPasswordOpen(true)}>
          <span>Смена пароля</span>
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
      <GridWindowSettings />
      <section>
        <h2 className={styles.Profile__SectionTitle}>Удаление аккаунта</h2>
        <p className={styles.Profile__Hint}>
          После удаления нельзя будет войти в этот профиль. Встречи, где вы организатор, пропадут для всех, кто ходил по
          ссылке.
        </p>
        <button
          type='button'
          className={`baseButton outlineButton ${styles.Profile__DeleteButton}`}
          onClick={() => {
            setDeleteStep("warn");
            setDeleteOpen(true);
          }}
        >
          Удалить аккаунт
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
      <ModalWrapper compact isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} isAnimate>
        <div className={styles.Profile__Modal}>
          <h2>Смена пароля</h2>
          <p>
            На {user.email} придёт письмо со ссылкой. По ней можно задать новый пароль. Само поле «Пароль» письмо не
            отправляет — только эта кнопка.
          </p>
          <div className={styles.Profile__ModalActions}>
            <button
              type='button'
              className='baseButton mainButton'
              disabled={passwordSending}
              onClick={async () => {
                setPasswordSending(true);
                try {
                  await resetPasswordRequest(user.email);
                  setPasswordOpen(false);
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
                } finally {
                  setPasswordSending(false);
                }
              }}
            >
              Отправить ссылку на почту
            </button>
            <button type='button' className='baseButton secondaryButton' onClick={() => setPasswordOpen(false)}>
              Отменить
            </button>
          </div>
        </div>
      </ModalWrapper>
      <ModalWrapper compact isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} isAnimate>
        {deleteStep === "warn" ? (
          <div className={styles.Profile__Modal}>
            <h2>Удалить аккаунт?</h2>
            <ul className={styles.Profile__ModalList}>
              <li>Войти в этот профиль больше не получится</li>
              <li>Встречи, где вы организатор, пропадут</li>
              <li>Слоты, которые вы ставили как участник, останутся под именем на встрече</li>
            </ul>
            <div className={styles.Profile__ModalActions}>
              <button type='button' className='baseButton outlineButton' onClick={() => setDeleteStep("reason")}>
                Продолжить удаление
              </button>
              <button type='button' className='baseButton secondaryButton' onClick={() => setDeleteOpen(false)}>
                Оставить аккаунт
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.Profile__Modal}>
            <h2>Почему удаляете?</h2>
            <p>Можно написать в поддержку — иногда проще выключить уведомления, чем сносить профиль.</p>
            <p className={styles.Profile__Hint}>
              Само удаление из кабинета пока не подключено на сервере. Если профиль правда нужно убрать, напишите нам.
            </p>
            <div className={styles.Profile__ModalActions}>
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
              <button type='button' className='baseButton secondaryButton' onClick={() => setDeleteOpen(false)}>
                Закрыть
              </button>
            </div>
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
        Это ваши типичные часы, не окно конкретной встречи. На новой встрече, если вы ещё не голосовали, Termeet может
        предложить закрасить сетку этим шаблоном. Сначала задайте интервал на все дни, потом откройте календарь недели и
        поправьте субботу или понедельник отдельно.
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

const GridWindowSettings = () => {
  const addToast = useToastStore(state => state.addToast);
  const saved = readGridWindow();
  const [start, setStart] = useState(saved.start);
  const [end, setEnd] = useState(saved.end);

  return (
    <section>
      <h2 className={styles.Profile__SectionTitle}>Часы сетки при создании</h2>
      <p className={styles.Profile__Hint}>
        На странице создания встречи окно «с какого по какой час» остаётся у всех, в том числе у гостя. Здесь можно
        запомнить свои привычные часы — они подставятся в форму, когда вы залогинены. Пока это только на этом
        устройстве.
      </p>
      <div className={styles.Profile__Interval}>
        <Select
          name='grid-start'
          className={styles.Profile__IntervalSelect}
          options={TIMES}
          value={start}
          disabledFunc={value => value.replaceAll(" ", "") >= end.replaceAll(" ", "")}
          onChange={setStart}
        />
        <Select
          name='grid-end'
          className={styles.Profile__IntervalSelect}
          options={TIMES}
          value={end}
          disabledFunc={value => value.replaceAll(" ", "") <= start.replaceAll(" ", "")}
          onChange={setEnd}
        />
      </div>
      <button
        type='button'
        className={`baseButton mainButton ${styles.Profile__SaveTemplate}`}
        onClick={() => {
          localStorage.setItem(GRID_WINDOW_KEY, JSON.stringify({ start, end }));
          addToast({ id: "grid-window-saved", type: "success", message: "Часы сетки запомнили на этом устройстве" });
        }}
      >
        Запомнить для создания
      </button>
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
      <img className={styles.Profile__StubImage} src={stubImage} alt='' />
      <p>{title}</p>
    </div>
  );
};
