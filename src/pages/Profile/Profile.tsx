import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  deleteAccountRequest,
  getMeRequest,
  resendVerificationRequest,
  resetPasswordRequest,
  startTelegramLinkRequest,
  unlinkTelegramRequest,
  uploadAvatarRequest,
  useSessionStore,
  fillWeekWithInterval,
  getAvailabilityDayRows,
  hasAvailability,
  isNineToSixEveryDay,
  useShowOnboarding,
  CONTACT_EMAIL_PATTERN,
  CONTACT_TELEGRAM_PATTERN,
  CONTACT_VK_PATTERN,
  parseContactEmail,
  parseContactTelegram,
  parseContactVk,
  type IAvailabilityInterval,
  type IUser,
} from "@/entities/User";
import { useToastStore } from "@/features/ToastContainer";
import { HttpError } from "@/shared/api";
import { TIMES } from "@/shared/consts";
import { LOCALE_LABEL, LOCALES, changeAppLocale, parseLocale, useTranslation } from "@/shared/i18n";
import { useTheme } from "@/shared/libs";
import { Container, Input, ModalWrapper, PhotoPicker, Select, TextArea, userAvatarUrl } from "@/shared/ui";
import { FeedbackForm } from "@/widgets/FeedbackForm";
import Arrow from "@assets/icons/arrow.svg";
import TelegramLogo from "@assets/icons/tg.svg";
import YandexLogo from "@assets/icons/YandexID.svg";
import styles from "./Profile.module.css";
import { TemplateWeekModal } from "./ui/TemplateWeekModal/TemplateWeekModal";

type ProfileTab = "profile" | "notifications" | "integrations" | "appearance" | "support";

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

const scrollNavItemFullyVisible = (nav: HTMLElement, item: HTMLElement) => {
  const navRect = nav.getBoundingClientRect();
  const itemRect = item.getBoundingClientRect();
  const padLeft = Number.parseFloat(getComputedStyle(nav).paddingLeft) || 0;
  const padRight = Number.parseFloat(getComputedStyle(nav).paddingRight) || 0;
  const leftBound = navRect.left + padLeft;
  const rightBound = navRect.right - padRight;

  if (itemRect.left >= leftBound && itemRect.right <= rightBound) {
    return;
  }

  const delta =
    itemRect.width > rightBound - leftBound || itemRect.left < leftBound
      ? itemRect.left - leftBound
      : itemRect.right - rightBound;

  nav.scrollBy({ left: delta, behavior: "smooth" });
};

export const Profile = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSessionStore(state => state.user);
  const status = useSessionStore(state => state.status);
  const { t } = useTranslation();
  const tab = (searchParams.get("tab") as ProfileTab) || "profile";
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status === "anonymous") {
      navigate("/", { replace: true });
    }
  }, [navigate, status]);

  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>("[data-nav-active='true']");
    if (nav && active) {
      scrollNavItemFullyVisible(nav, active);
    }
  }, [tab]);

  if (!user) {
    return null;
  }

  const setTab = (next: ProfileTab) => {
    setSearchParams(next === "profile" ? {} : { tab: next }, { replace: true });
  };

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "profile", label: t("profile.tabProfile") },
    { id: "notifications", label: t("profile.tabNotifications") },
    { id: "integrations", label: t("profile.tabIntegrations") },
    { id: "appearance", label: t("profile.tabAppearance") },
    { id: "support", label: t("profile.tabSupport") },
  ];

  return (
    <Container>
      <button type='button' className={styles.Profile__Back} onClick={() => navigate("/")}>
        <Arrow className={styles.Profile__BackIcon} />
        {t("profile.back")}
      </button>
      <div className={styles.Profile}>
        <nav ref={navRef} className={styles.Profile__Nav} aria-label={t("profile.navAria")}>
          {tabs.map(item => (
            <button
              key={item.id}
              type='button'
              className={`${styles.Profile__NavItem} ${tab === item.id ? styles.Profile__NavItem_active : ""}`}
              data-nav-active={tab === item.id ? "true" : undefined}
              onClick={event => {
                setTab(item.id);
                const nav = navRef.current;
                if (nav) {
                  scrollNavItemFullyVisible(nav, event.currentTarget);
                }
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className={styles.Profile__Content}>
          {tab === "profile" ? <ProfileSettings user={user} /> : null}
          {tab === "notifications" ? <NotificationSettings user={user} /> : null}
          {tab === "integrations" ? <IntegrationsSettings user={user} /> : null}
          {tab === "appearance" ? <AppearanceSettings /> : null}
          {tab === "support" ? <FeedbackForm /> : null}
        </div>
      </div>
    </Container>
  );
};

const ProfileSettings = ({ user }: { user: IUser }) => {
  const navigate = useNavigate();
  const logout = useSessionStore(state => state.logout);
  const updateSettings = useSessionStore(state => state.updateSettings);
  const setUser = useSessionStore(state => state.setUser);
  const addToast = useToastStore(state => state.addToast);
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [nameSaving, setNameSaving] = useState(false);
  const [avatarBust, setAvatarBust] = useState(0);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [contactEmail, setContactEmail] = useState(user.contact_email ?? "");
  const [contactTelegram, setContactTelegram] = useState(user.contact_telegram ?? "");
  const [contactVk, setContactVk] = useState(user.contact_vk ?? "");
  const [contactEmailError, setContactEmailError] = useState(false);
  const [contactTelegramError, setContactTelegramError] = useState(false);
  const [contactVkError, setContactVkError] = useState(false);
  const [contactsSaving, setContactsSaving] = useState(false);
  const [timezone, setTimezone] = useState(user.timezone || "UTC +3:00 (Москва)");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSending, setPasswordSending] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"warn" | "reason" | "confirm">("warn");
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deleteSaving, setDeleteSaving] = useState(false);

  const nameDirty = firstName.trim() !== user.first_name || lastName.trim() !== user.last_name;

  return (
    <div className={styles.Profile__Stack}>
      <section>
        <h2 className={styles.Profile__SectionTitle}>{t("profile.nameTitle")}</h2>
        <Input
          name='first_name'
          label={t("profile.firstName")}
          value={firstName}
          onChange={event => setFirstName(event.target.value)}
        />
        <div className={styles.Profile__FieldGap} />
        <Input
          name='last_name'
          label={t("profile.lastName")}
          value={lastName}
          onChange={event => setLastName(event.target.value)}
        />
        {nameDirty ? (
          <button
            type='button'
            className={`baseButton mainButton ${styles.Profile__SaveTemplate}`}
            disabled={nameSaving}
            onClick={async () => {
              const nextFirst = firstName.trim();
              const nextLast = lastName.trim();
              if (!nextFirst || !nextLast) {
                addToast({ id: "name-empty", type: "warning", message: t("toast.nameEmpty") });
                return;
              }
              setNameSaving(true);
              try {
                await updateSettings({ first_name: nextFirst, last_name: nextLast });
                addToast({ id: "name-saved", type: "success", message: t("toast.nameSaved") });
              } catch {
                addToast({ id: "name-saved-error", type: "error", message: t("toast.nameError") });
              } finally {
                setNameSaving(false);
              }
            }}
          >
            {t("profile.saveName")}
          </button>
        ) : null}
      </section>
      <section>
        <h2 className={styles.Profile__SectionTitle}>{t("profile.photoTitle")}</h2>
        <PhotoPicker
          src={user.has_avatar ? userAvatarUrl(user.id, avatarBust) : null}
          label={t("profile.photo")}
          hint={t("profile.photoHint")}
          disabled={avatarSaving}
          onFile={async file => {
            setAvatarSaving(true);
            try {
              const next = await uploadAvatarRequest(file);
              setUser(next);
              setAvatarBust(bust => bust + 1);
              addToast({ id: "avatar-saved", type: "success", message: t("toast.avatarSaved") });
            } catch {
              addToast({ id: "avatar-error", type: "error", message: t("toast.avatarError") });
            } finally {
              setAvatarSaving(false);
            }
          }}
        />
      </section>
      <section>
        <h2 className={styles.Profile__SectionTitle}>{t("profile.contactsTitle")}</h2>
        <p className={styles.Profile__Hint}>{t("profile.contactsHint")}</p>
        <Input
          name='contact_email'
          type='email'
          label={t("profile.contactEmail")}
          placeholder='name@example.com'
          autoComplete='email'
          inputMode='email'
          pattern={CONTACT_EMAIL_PATTERN}
          title={t("profile.contactEmailError")}
          value={contactEmail}
          error={contactEmailError ? t("profile.contactEmailError") : undefined}
          onChange={event => {
            setContactEmail(event.target.value);
            setContactEmailError(false);
          }}
          onBlur={() => setContactEmailError(!parseContactEmail(contactEmail).valid)}
        />
        <div className={styles.Profile__FieldGap} />
        <Input
          name='contact_telegram'
          label={t("profile.contactTelegram")}
          placeholder='@username'
          autoComplete='off'
          spellCheck={false}
          pattern={CONTACT_TELEGRAM_PATTERN}
          title={t("profile.contactTelegramError")}
          value={contactTelegram}
          error={contactTelegramError ? t("profile.contactTelegramError") : undefined}
          onChange={event => {
            setContactTelegram(event.target.value);
            setContactTelegramError(false);
          }}
          onBlur={() => setContactTelegramError(!parseContactTelegram(contactTelegram).valid)}
        />
        <div className={styles.Profile__FieldGap} />
        <Input
          name='contact_vk'
          label={t("profile.contactVk")}
          placeholder='vk.com/id'
          autoComplete='off'
          spellCheck={false}
          pattern={CONTACT_VK_PATTERN}
          title={t("profile.contactVkError")}
          value={contactVk}
          error={contactVkError ? t("profile.contactVkError") : undefined}
          onChange={event => {
            setContactVk(event.target.value);
            setContactVkError(false);
          }}
          onBlur={() => setContactVkError(!parseContactVk(contactVk).valid)}
        />
        <button
          type='button'
          className={`baseButton mainButton ${styles.Profile__SaveTemplate}`}
          disabled={contactsSaving}
          onClick={async () => {
            const email = parseContactEmail(contactEmail);
            const telegram = parseContactTelegram(contactTelegram);
            const vk = parseContactVk(contactVk);
            setContactEmailError(!email.valid);
            setContactTelegramError(!telegram.valid);
            setContactVkError(!vk.valid);
            if (!email.valid || !telegram.valid || !vk.valid) {
              addToast({ id: "contacts-invalid", type: "warning", message: t("toast.contactsInvalid") });
              return;
            }
            setContactEmail(email.value ?? "");
            setContactTelegram(telegram.value ?? "");
            setContactVk(vk.value ?? "");
            setContactsSaving(true);
            try {
              await updateSettings({
                contact_email: email.value,
                contact_telegram: telegram.value,
                contact_vk: vk.value,
              });
              addToast({ id: "contacts-saved", type: "success", message: t("toast.contactsSaved") });
            } catch {
              addToast({ id: "contacts-error", type: "error", message: t("toast.contactsError") });
            } finally {
              setContactsSaving(false);
            }
          }}
        >
          {t("profile.saveContacts")}
        </button>
      </section>
      <section>
        <h2 className={styles.Profile__SectionTitle}>{t("profile.security")}</h2>
        <Input
          name='email'
          value={user.email}
          readOnly
          error={user.is_verified ? undefined : t("profile.emailConfirm")}
        />
        {!user.is_verified ? (
          <button
            type='button'
            className={styles.Profile__LinkButton}
            onClick={async () => {
              try {
                await resendVerificationRequest();
                addToast({ id: "verify-resent", type: "success", message: t("toast.verifyResent") });
              } catch {
                addToast({ id: "verify-resent-error", type: "error", message: t("toast.verifyError") });
              }
            }}
          >
            {t("profile.resend")}
          </button>
        ) : null}
        <button type='button' className={styles.Profile__Row} onClick={() => setPasswordOpen(true)}>
          <span>{t("profile.changePassword")}</span>
          <Arrow className={styles.Profile__RowArrow} />
        </button>
      </section>
      <section>
        <h2 className={styles.Profile__SectionTitle}>{t("profile.timezone")}</h2>
        <Select
          name='timezone'
          options={TIMEZONES}
          value={timezone}
          onChange={async value => {
            setTimezone(value);
            try {
              await updateSettings({ timezone: value });
              addToast({ id: "tz-saved", type: "success", message: t("toast.tzSaved") });
            } catch {
              addToast({ id: "tz-saved-error", type: "error", message: t("toast.tzError") });
            }
          }}
        />
      </section>
      <AvailabilityTemplateSettings user={user} />
      <GridWindowSettings user={user} />
      <section>
        <h2 className={styles.Profile__SectionTitle}>{t("profile.deleteTitle")}</h2>
        <p className={styles.Profile__Hint}>{t("profile.deleteHint")}</p>
        <button
          type='button'
          className={`baseButton outlineButton ${styles.Profile__DeleteButton}`}
          onClick={() => {
            setDeleteStep("warn");
            setDeleteReason("");
            setDeleteEmail("");
            setDeleteOpen(true);
          }}
        >
          {t("profile.deleteButton")}
        </button>
      </section>
      <button type='button' className='baseButton secondaryButton' onClick={() => setLogoutOpen(true)}>
        {t("profile.logout")}
      </button>
      <ModalWrapper compact isOpen={passwordOpen} onClose={() => setPasswordOpen(false)} isAnimate>
        <div className={styles.Profile__Modal}>
          <h2>{t("profile.passwordTitle")}</h2>
          <p>{t("profile.passwordBody", { email: user.email })}</p>
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
                  addToast({ id: "reset-sent", type: "success", message: t("toast.resetSent") });
                } catch {
                  addToast({ id: "reset-sent-error", type: "error", message: t("toast.resetError") });
                } finally {
                  setPasswordSending(false);
                }
              }}
            >
              {t("profile.passwordSend")}
            </button>
            <button type='button' className='baseButton secondaryButton' onClick={() => setPasswordOpen(false)}>
              {t("profile.cancel")}
            </button>
          </div>
        </div>
      </ModalWrapper>
      <ModalWrapper compact isOpen={logoutOpen} onClose={() => setLogoutOpen(false)} isAnimate>
        <div className={styles.Profile__Modal}>
          <h2>{t("profile.logoutTitle")}</h2>
          <p>{t("profile.logoutBody")}</p>
          <div className={styles.Profile__ModalActions}>
            <button
              type='button'
              className='baseButton mainButton'
              onClick={async () => {
                await logout();
                addToast({ id: "logout-success", type: "info", message: t("toast.logoutOk") });
                navigate("/");
              }}
            >
              {t("profile.logoutConfirm")}
            </button>
            <button type='button' className='baseButton secondaryButton' onClick={() => setLogoutOpen(false)}>
              {t("profile.stay")}
            </button>
          </div>
        </div>
      </ModalWrapper>
      <ModalWrapper compact isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} isAnimate>
        {deleteStep === "warn" ? (
          <div className={styles.Profile__Modal}>
            <h2>{t("profile.deleteWarnTitle")}</h2>
            <ul className={styles.Profile__ModalList}>
              <li>{t("profile.deleteWarn1")}</li>
              <li>{t("profile.deleteWarn2")}</li>
              <li>{t("profile.deleteWarn3")}</li>
            </ul>
            <div className={styles.Profile__ModalActions}>
              <button type='button' className='baseButton outlineButton' onClick={() => setDeleteStep("reason")}>
                {t("profile.deleteContinue")}
              </button>
              <button type='button' className='baseButton secondaryButton' onClick={() => setDeleteOpen(false)}>
                {t("profile.keepAccount")}
              </button>
            </div>
          </div>
        ) : null}
        {deleteStep === "reason" ? (
          <div className={styles.Profile__Modal}>
            <h2>{t("profile.deleteReasonTitle")}</h2>
            <p>{t("profile.deleteReasonBody")}</p>
            <TextArea
              name='delete-reason'
              label=''
              placeholder={t("profile.deleteReasonPlaceholder")}
              value={deleteReason}
              onChange={event => setDeleteReason(event.target.value)}
            />
            <div className={styles.Profile__ModalActions}>
              <button type='button' className='baseButton mainButton' onClick={() => setDeleteStep("confirm")}>
                {t("profile.deleteReasonNext")}
              </button>
              <button type='button' className='baseButton secondaryButton' onClick={() => setDeleteStep("warn")}>
                {t("profile.deleteBack")}
              </button>
            </div>
          </div>
        ) : null}
        {deleteStep === "confirm" ? (
          <div className={styles.Profile__Modal}>
            <h2>{t("profile.deleteConfirmTitle")}</h2>
            <p>{t("profile.deleteConfirmBody", { email: user.email })}</p>
            <Input
              name='delete-email'
              placeholder={t("profile.deleteConfirmPlaceholder")}
              value={deleteEmail}
              onChange={event => setDeleteEmail(event.target.value)}
            />
            <div className={styles.Profile__ModalActions}>
              <button
                type='button'
                className={`baseButton outlineButton ${styles.Profile__DeleteButton}`}
                disabled={deleteSaving || deleteEmail.trim().toLowerCase() !== user.email.toLowerCase()}
                onClick={async () => {
                  setDeleteSaving(true);
                  try {
                    await deleteAccountRequest();
                    useSessionStore.getState().clear();
                    setDeleteOpen(false);
                    addToast({ id: "account-deleted", type: "info", message: t("toast.deleted") });
                    navigate("/");
                  } catch {
                    addToast({ id: "account-deleted-error", type: "error", message: t("toast.deleteError") });
                  } finally {
                    setDeleteSaving(false);
                  }
                }}
              >
                {t("profile.deleteForever")}
              </button>
              <button type='button' className='baseButton secondaryButton' onClick={() => setDeleteStep("reason")}>
                {t("profile.deleteBack")}
              </button>
            </div>
          </div>
        ) : null}
      </ModalWrapper>
    </div>
  );
};

const AvailabilityTemplateSettings = ({ user }: { user: IUser }) => {
  const updateSettings = useSessionStore(state => state.updateSettings);
  const addToast = useToastStore(state => state.addToast);
  const { t } = useTranslation();
  const savedTemplate = user.availability_template ?? [];
  const [quickStart, setQuickStart] = useState("09:00");
  const [quickEnd, setQuickEnd] = useState("18:00");
  const [weekOpen, setWeekOpen] = useState(false);
  const suggestPrefill = user.suggest_prefill !== false;
  const dayRows = getAvailabilityDayRows(savedTemplate);
  const showDayRows = hasAvailability(savedTemplate) && !isNineToSixEveryDay(savedTemplate);

  const saveTemplate = async (next: IAvailabilityInterval[]) => {
    try {
      await updateSettings({ availability_template: next });
      addToast({ id: "template-saved", type: "success", message: t("toast.templateSaved") });
    } catch {
      addToast({ id: "template-saved-error", type: "error", message: t("toast.templateError") });
    }
  };

  return (
    <section>
      <h2 className={styles.Profile__SectionTitle}>{t("profile.templateTitle")}</h2>
      <p className={styles.Profile__Hint}>{t("profile.templateHint")}</p>
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
      <div className={styles.Profile__TemplateActions}>
        <button
          type='button'
          className='baseButton mainButton'
          onClick={() => saveTemplate(fillWeekWithInterval(quickStart, quickEnd))}
        >
          {t("profile.fillWeek")}
        </button>
        <button type='button' className='baseButton secondaryButton' onClick={() => setWeekOpen(true)}>
          {t("profile.openWeek")}
        </button>
        {hasAvailability(savedTemplate) ? (
          <button type='button' className='baseButton outlineButton' onClick={() => saveTemplate([])}>
            {t("profile.clearTemplate")}
          </button>
        ) : null}
      </div>
      {isNineToSixEveryDay(savedTemplate) ? (
        <p className={styles.Profile__Hint}>{t("profile.everyDayNineSix")}</p>
      ) : null}
      {showDayRows ? (
        <div className={styles.Profile__WeekSummary}>
          <p className={styles.Profile__WeekSummaryTitle}>{t("profile.templateNow")}</p>
          {dayRows.map(row => (
            <div key={row.weekday} className={styles.Profile__WeekSummaryRow}>
              <span className={styles.Profile__WeekSummaryDay}>{t(`week.full${row.weekday}`)}</span>
              <span className={styles.Profile__WeekSummaryRanges}>
                {row.ranges.map(range => (
                  <span key={range} className={styles.Profile__RangeChip}>
                    {range}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      <label className={styles.Profile__ToggleRow}>
        <span>{t("profile.suggestPrefill")}</span>
        <button
          type='button'
          role='switch'
          aria-checked={suggestPrefill}
          className={`${styles.Profile__Switch} ${suggestPrefill ? styles.Profile__Switch_on : ""}`}
          onClick={async () => {
            try {
              await updateSettings({ suggest_prefill: !suggestPrefill });
            } catch {
              addToast({ id: "prefill-toggle-error", type: "error", message: t("toast.prefillError") });
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

const GridWindowSettings = ({ user }: { user: IUser }) => {
  const updateSettings = useSessionStore(state => state.updateSettings);
  const addToast = useToastStore(state => state.addToast);
  const { t } = useTranslation();
  const [start, setStart] = useState(user.grid_window_start || "10 : 00");
  const [end, setEnd] = useState(user.grid_window_end || "19 : 00");

  useEffect(() => {
    setStart(user.grid_window_start || "10 : 00");
    setEnd(user.grid_window_end || "19 : 00");
  }, [user.grid_window_start, user.grid_window_end]);

  return (
    <section>
      <h2 className={styles.Profile__SectionTitle}>{t("profile.gridTitle")}</h2>
      <p className={styles.Profile__Hint}>{t("profile.gridHint")}</p>
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
        onClick={async () => {
          try {
            await updateSettings({ grid_window_start: start, grid_window_end: end });
            addToast({ id: "grid-window-saved", type: "success", message: t("toast.gridSaved") });
          } catch {
            addToast({ id: "grid-window-error", type: "error", message: t("toast.gridError") });
          }
        }}
      >
        {t("profile.gridSave")}
      </button>
    </section>
  );
};

const NotificationSettings = ({ user }: { user: IUser }) => {
  const updateSettings = useSessionStore(state => state.updateSettings);
  const addToast = useToastStore(state => state.addToast);
  const { t } = useTranslation();
  const notifyVote = user.notify_on_vote ?? true;
  const notifyFinal = user.notify_on_final ?? true;

  const toggle = async (payload: { notify_on_vote?: boolean; notify_on_final?: boolean }) => {
    try {
      await updateSettings(payload);
    } catch {
      addToast({ id: "notify-toggle-error", type: "error", message: t("toast.notifyError") });
    }
  };

  return (
    <div className={styles.Profile__Stack}>
      <section>
        <h2 className={styles.Profile__SectionTitle}>{t("profile.notifyTitle")}</h2>
        <p className={styles.Profile__Hint}>{t("profile.notifyHint")}</p>
        <label className={styles.Profile__ToggleRow}>
          <span>{t("profile.notifyVote")}</span>
          <button
            type='button'
            role='switch'
            aria-checked={notifyVote}
            className={`${styles.Profile__Switch} ${notifyVote ? styles.Profile__Switch_on : ""}`}
            onClick={() => toggle({ notify_on_vote: !notifyVote })}
          />
        </label>
        <label className={styles.Profile__ToggleRow}>
          <span>{t("profile.notifyFinal")}</span>
          <button
            type='button'
            role='switch'
            aria-checked={notifyFinal}
            className={`${styles.Profile__Switch} ${notifyFinal ? styles.Profile__Switch_on : ""}`}
            onClick={() => toggle({ notify_on_final: !notifyFinal })}
          />
        </label>
      </section>
    </div>
  );
};

const IntegrationsSettings = ({ user }: { user: IUser }) => {
  const { t } = useTranslation();
  const setUser = useSessionStore(state => state.setUser);
  const addToast = useToastStore(state => state.addToast);
  const [busy, setBusy] = useState(false);
  const pollRef = useRef<number | null>(null);
  const hasYandex = Boolean(user.has_yandex);
  const hasCalendar = Boolean(user.has_calendar);
  const telegramLinked = Boolean(user.telegram_linked);
  const telegramNick = user.telegram_username?.trim();
  const yandexName = user.yandex_name?.trim();
  const yandexLogin = user.yandex_login?.trim();
  const yandexEmail = user.yandex_email?.trim();

  const stopPoll = () => {
    if (pollRef.current != null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const refreshUser = async () => {
    const next = await getMeRequest();
    setUser(next);
    return next;
  };

  useEffect(() => {
    const onFocus = () => {
      void refreshUser().then(next => {
        if (next.telegram_linked) {
          stopPoll();
        }
      });
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      stopPoll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- статус привязки при возврате из Telegram
  }, []);

  const linkTelegram = async () => {
    setBusy(true);
    try {
      const { url } = await startTelegramLinkRequest();
      window.open(url, "_blank", "noopener,noreferrer");
      addToast({ id: "tg-link-open", type: "info", message: t("toast.telegramLinkOpened") });
      stopPoll();
      const started = Date.now();
      pollRef.current = window.setInterval(() => {
        void (async () => {
          if (Date.now() - started > 120000) {
            stopPoll();
            return;
          }
          try {
            const next = await getMeRequest();
            setUser(next);
            if (next.telegram_linked) {
              stopPoll();
              addToast({ id: "tg-linked", type: "success", message: t("toast.telegramLinked") });
            }
          } catch {
            // окно ещё открыто, аккаунт ещё не подтвердил
          }
        })();
      }, 3000);
    } catch (error) {
      const notReady = error instanceof HttpError && error.status === 503;
      addToast({
        id: "tg-link-error",
        type: "error",
        message: t(notReady ? "toast.telegramNotConfigured" : "toast.telegramLinkError"),
      });
    } finally {
      setBusy(false);
    }
  };

  const unlinkTelegram = async () => {
    setBusy(true);
    stopPoll();
    try {
      const next = await unlinkTelegramRequest();
      setUser(next);
      addToast({ id: "tg-unlinked", type: "success", message: t("toast.telegramUnlinked") });
    } catch {
      addToast({ id: "tg-unlink-error", type: "error", message: t("toast.telegramUnlinkError") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.Profile__Stack}>
      <section>
        <h2 className={styles.Profile__SectionTitle}>{t("profile.telegramTitle")}</h2>
        <p className={styles.Profile__Hint}>{t("profile.telegramHint")}</p>
        <div className={styles.Profile__Row}>
          <span className={styles.Profile__IntegrationName}>
            <TelegramLogo />
            {telegramLinked ? t("profile.telegramConnected") : t("profile.telegramDisconnected")}
          </span>
          {telegramNick ? <span className={styles.Profile__IntegrationStatus}>@{telegramNick}</span> : null}
        </div>
        {telegramLinked ? null : <p className={styles.Profile__Hint}>{t("profile.telegramWait")}</p>}
        <div className={styles.Profile__Actions}>
          {telegramLinked ? (
            <button
              type='button'
              className={`baseButton outlineButton ${styles.Profile__SaveTemplate}`}
              disabled={busy}
              onClick={() => void unlinkTelegram()}
            >
              {t("profile.telegramUnlink")}
            </button>
          ) : (
            <button
              type='button'
              className={`baseButton mainButton ${styles.Profile__SaveTemplate}`}
              disabled={busy}
              onClick={() => void linkTelegram()}
            >
              <TelegramLogo />
              <span>{t("profile.telegramConnect")}</span>
            </button>
          )}
        </div>
      </section>
      <section>
        <h2 className={styles.Profile__SectionTitle}>{t("profile.yandexTitle")}</h2>
        <p className={styles.Profile__Hint}>{t("profile.yandexHint")}</p>
        <div className={styles.Profile__Row}>
          <span className={styles.Profile__IntegrationName}>
            <YandexLogo />
            {hasYandex ? t("profile.yandexConnected") : t("profile.yandexDisconnected")}
          </span>
          {hasCalendar ? (
            <span className={styles.Profile__IntegrationStatus}>{t("profile.yandexCalendar")}</span>
          ) : null}
        </div>
        {hasYandex ? (
          <div className={styles.Profile__YandexCard}>
            {yandexName ? <p className={styles.Profile__YandexName}>{yandexName}</p> : null}
            {yandexLogin ? (
              <p className={styles.Profile__Hint}>
                {t("profile.yandexLogin")}: @{yandexLogin}
              </p>
            ) : null}
            {yandexEmail ? (
              <p className={styles.Profile__Hint}>
                {t("profile.yandexMail")}: {yandexEmail}
              </p>
            ) : null}
            <p className={styles.Profile__Hint}>
              {hasCalendar ? t("profile.yandexCalendarOn") : t("profile.yandexCalendarOff")}
            </p>
          </div>
        ) : (
          <p className={styles.Profile__Hint}>{t("profile.yandexNeedConnect")}</p>
        )}
        <button
          type='button'
          className={`baseButton ${hasYandex ? "outlineButton" : "mainButton"} ${styles.Profile__SaveTemplate}`}
          onClick={() => {
            window.location.assign("/api/auth/yandex/url?intent=link");
          }}
        >
          <YandexLogo />
          <span>{hasYandex ? t("profile.yandexReconnect") : t("profile.yandexConnect")}</span>
        </button>
      </section>
    </div>
  );
};

const AppearanceSettings = () => {
  const { theme, setTheme } = useTheme();
  const userTheme = useSessionStore(state => state.user?.theme);
  const updateSettings = useSessionStore(state => state.updateSettings);
  const addToast = useToastStore(state => state.addToast);
  const { t, i18n } = useTranslation();
  const locale = parseLocale(i18n.language);
  const currentTheme = userTheme ?? theme;
  const { enabled: showOnboarding, setEnabled: setShowOnboarding } = useShowOnboarding();

  return (
    <div className={styles.Profile__Stack}>
      <label className={styles.Profile__ToggleRow}>
        <span>{t("profile.themeLight")}</span>
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
              addToast({ id: "theme-saved-error", type: "error", message: t("toast.themeError") });
            }
          }}
        />
      </label>
      <label className={styles.Profile__ToggleRow}>
        <span>{t("profile.showOnboarding")}</span>
        <button
          type='button'
          role='switch'
          aria-checked={showOnboarding}
          className={`${styles.Profile__Switch} ${showOnboarding ? styles.Profile__Switch_on : ""}`}
          onClick={async () => {
            try {
              await setShowOnboarding(!showOnboarding);
            } catch {
              addToast({ id: "onboarding-toggle-error", type: "error", message: t("toast.onboardingError") });
            }
          }}
        />
      </label>
      <section>
        <h2 className={styles.Profile__SectionTitle}>{t("profile.language")}</h2>
        <Select
          name='language'
          options={LOCALES.map(item => LOCALE_LABEL[item])}
          value={LOCALE_LABEL[locale]}
          onChange={async value => {
            const next = parseLocale(value);
            await changeAppLocale(next);
            try {
              await updateSettings({ locale: next });
            } catch {
              addToast({ id: "lang-saved-error", type: "error", message: t("toast.langError") });
            }
          }}
        />
      </section>
      <button
        type='button'
        className={styles.Profile__Row}
        onClick={() => addToast({ id: "tester-soon", type: "info", message: t("toast.testerSoon") })}
      >
        {t("profile.tester")}
        <Arrow className={styles.Profile__RowArrow} />
      </button>
    </div>
  );
};
