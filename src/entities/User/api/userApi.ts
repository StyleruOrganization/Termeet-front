import { apiClient } from "@/shared/api";
import type {
  IAvailabilityInterval,
  ILoginPayload,
  IRegisterPayload,
  ITokenInfo,
  IUser,
  IUserMeeting,
  IUserSearchItem,
  IUserSettingsUpdate,
  IYandexCalendarMonth,
} from "../model/User.types";

type RawUser = IUser & {
  suggestPrefill?: boolean;
  availabilityTemplate?: IAvailabilityInterval[];
  gridWindowStart?: string;
  gridWindowEnd?: string;
  notifyOnVote?: boolean;
  notifyOnFinal?: boolean;
  hasYandex?: boolean;
  hasTelemost?: boolean;
  hasCalendar?: boolean;
  yandexLogin?: string | null;
  yandexEmail?: string | null;
  yandexName?: string | null;
  showOnboarding?: boolean;
};

export const normalizeUser = (raw: RawUser): IUser => {
  const locale = raw.locale === "en" || raw.locale === "de" ? raw.locale : "ru";
  return {
    ...raw,
    timezone: raw.timezone || "UTC +3:00 (Москва)",
    theme: raw.theme === "dark" ? "dark" : "light",
    suggest_prefill: raw.suggest_prefill ?? raw.suggestPrefill ?? true,
    availability_template: raw.availability_template ?? raw.availabilityTemplate ?? [],
    locale,
    grid_window_start: raw.grid_window_start ?? raw.gridWindowStart ?? "10 : 00",
    grid_window_end: raw.grid_window_end ?? raw.gridWindowEnd ?? "19 : 00",
    notify_on_vote: raw.notify_on_vote ?? raw.notifyOnVote ?? true,
    notify_on_final: raw.notify_on_final ?? raw.notifyOnFinal ?? true,
    has_yandex: raw.has_yandex ?? raw.hasYandex ?? false,
    has_telemost: raw.has_telemost ?? raw.hasTelemost ?? false,
    has_calendar: raw.has_calendar ?? raw.hasCalendar ?? false,
    yandex_login: raw.yandex_login ?? raw.yandexLogin ?? null,
    yandex_email: raw.yandex_email ?? raw.yandexEmail ?? null,
    yandex_name: raw.yandex_name ?? raw.yandexName ?? null,
    show_onboarding: raw.show_onboarding ?? raw.showOnboarding ?? true,
  };
};

export const loginRequest = (payload: ILoginPayload) => {
  return apiClient.post<ITokenInfo, ILoginPayload>("/auth/login", payload);
};

export const registerRequest = (payload: IRegisterPayload) => {
  return apiClient.post<ITokenInfo & Partial<IUser>, IRegisterPayload>("/auth/register", payload);
};

export const logoutRequest = () => {
  return apiClient.post<{ detail: string }>("/auth/logout");
};

export const yandexCallbackRequest = (code: string, state?: string | null) => {
  return apiClient.post<ITokenInfo, { code: string; state?: string }>("/auth/yandex/callback", {
    code,
    ...(state ? { state } : {}),
  });
};

export const yandexClientRequest = () => {
  return apiClient.get<{ client_id: string; scope: string }>("/auth/yandex/client");
};

export const yandexTokenRequest = (accessToken: string, expiresIn?: number) => {
  return apiClient.post<ITokenInfo, { access_token: string; expires_in?: number }>("/auth/yandex/token", {
    access_token: accessToken,
    ...(expiresIn ? { expires_in: expiresIn } : {}),
  });
};

export const getMeRequest = async () => {
  const user = await apiClient.get<RawUser>("/users/me");
  return normalizeUser(user);
};

export const updateMeRequest = async (payload: IUserSettingsUpdate) => {
  const user = await apiClient.patch<RawUser, IUserSettingsUpdate>("/users/me", payload);
  return normalizeUser(user);
};

export const deleteAccountRequest = () => {
  return apiClient.delete<{ detail: string }>("/users/me");
};

export const confirmEmailRequest = (token: string) => {
  return apiClient.post<{ detail: string }>(`/auth/confirm-email/verify?token=${encodeURIComponent(token)}`);
};

export const resetPasswordRequest = (email: string) => {
  return apiClient.post<{ detail: string }, { email: string }>("/auth/reset-password", { email });
};

export const resetPasswordVerifyRequest = (token: string, password: string) => {
  return apiClient.post<ITokenInfo, { password: string }>(
    `/auth/reset-password/verify?token=${encodeURIComponent(token)}`,
    { password },
  );
};

export const resendVerificationRequest = () => {
  return apiClient.post<{ detail: string }>("/auth/confirm-email");
};

export const searchUsersRequest = (query: string) => {
  return apiClient.get<IUserSearchItem[]>(`/users/search?q=${encodeURIComponent(query)}`);
};

export const getMyMeetingsRequest = async () => {
  const data = await apiClient.get<
    Array<
      IUserMeeting & {
        data_range?: [string, string][];
        has_final?: boolean;
        final_slot?: [string, string][] | null;
        finalSlot?: [string, string][] | null;
        participant_names?: string[];
        participant_count?: number;
      }
    >
  >("/users/me/meetings");
  return data.map(item => ({
    ...item,
    dataRange: item.dataRange ?? item.data_range ?? [],
    hasFinal: item.hasFinal ?? item.has_final ?? false,
    finalSlot: item.finalSlot ?? item.final_slot ?? [],
    participantNames: item.participantNames ?? item.participant_names ?? [],
    participantCount: item.participantCount ?? item.participant_count ?? item.participantNames?.length ?? 0,
  }));
};

export const getMyCalendarRequest = async (start: string, end: string) => {
  const data = await apiClient.get<IYandexCalendarMonth>(
    `/users/me/calendar?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
  );
  return {
    events: data.events ?? [],
    has_calendar: data.has_calendar ?? false,
    error: data.error ?? null,
  };
};
