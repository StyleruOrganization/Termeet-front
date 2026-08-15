import type { IBotTemplate } from "../lib/botTemplates";

export interface IAvailabilityInterval {
  /** 1 = понедельник … 7 = воскресенье. Нет поля — интервал для всех дней. */
  weekday?: number | null;
  start: string;
  end: string;
}

export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  nickname?: string | null;
  is_active: boolean;
  is_verified: boolean;
  email: string;
  additional_emails?: string[] | null;
  timezone?: string;
  theme?: "light" | "dark";
  suggest_prefill?: boolean;
  availability_template?: IAvailabilityInterval[];
  locale?: "ru" | "en" | "de";
  grid_window_start?: string;
  grid_window_end?: string;
  notify_on_vote?: boolean;
  notify_on_final?: boolean;
  notify_email?: boolean;
  notify_telegram?: boolean;
  has_password?: boolean;
  has_yandex?: boolean;
  has_telemost?: boolean;
  has_calendar?: boolean;
  yandex_login?: string | null;
  yandex_email?: string | null;
  yandex_name?: string | null;
  show_onboarding?: boolean;
  has_avatar?: boolean;
  contact_email?: string | null;
  contact_telegram?: string | null;
  contact_vk?: string | null;
  telegram_linked?: boolean;
  telegram_username?: string | null;
  bot_templates?: IBotTemplate[];
}

export interface IUserSettingsUpdate {
  first_name?: string;
  last_name?: string;
  timezone?: string;
  theme?: "light" | "dark";
  suggest_prefill?: boolean;
  availability_template?: IAvailabilityInterval[];
  locale?: "ru" | "en" | "de";
  grid_window_start?: string;
  grid_window_end?: string;
  notify_on_vote?: boolean;
  notify_on_final?: boolean;
  notify_email?: boolean;
  notify_telegram?: boolean;
  show_onboarding?: boolean;
  contact_email?: string | null;
  contact_telegram?: string | null;
  contact_vk?: string | null;
  bot_templates?: IBotTemplate[];
}

export interface ITokenInfo {
  access_token: string;
  token_type: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  do_verify_email: boolean;
}

export type SessionStatus = "idle" | "loading" | "authenticated" | "anonymous";

export interface IUserSearchItem {
  id: string;
  first_name: string;
  last_name: string;
  has_avatar?: boolean;
}

export interface IYandexCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  href?: string;
  source?: "yandex";
}

export interface IYandexCalendarMonth {
  events: IYandexCalendarEvent[];
  has_calendar?: boolean;
  error?: string | null;
}

export type UserMeetingRole = "owner" | "participant" | "observer" | "invited";

export interface IUserMeeting {
  hash: string;
  name: string;
  description?: string | null;
  duration?: string | null;
  link?: string | null;
  role: UserMeetingRole;
  dataRange: [string, string][];
  hasFinal?: boolean;
  finalSlot?: [string, string][];
  participantNames?: string[];
  participantCount?: number;
  teamId?: number | null;
  teamName?: string | null;
  isClosed?: boolean;
}
