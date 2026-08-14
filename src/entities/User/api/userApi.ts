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
        participant_names?: string[];
        participant_count?: number;
      }
    >
  >("/users/me/meetings");
  return data.map(item => ({
    ...item,
    dataRange: item.dataRange ?? item.data_range ?? [],
    hasFinal: item.hasFinal ?? item.has_final ?? false,
    participantNames: item.participantNames ?? item.participant_names ?? [],
    participantCount: item.participantCount ?? item.participant_count ?? item.participantNames?.length ?? 0,
  }));
};
