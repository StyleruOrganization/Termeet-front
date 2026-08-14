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
  participantNames?: string[];
  participantCount?: number;
}
