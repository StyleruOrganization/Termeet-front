import { apiClient } from "@/shared/api";
import type {
  IAvailabilityInterval,
  ILoginPayload,
  IRegisterPayload,
  ITokenInfo,
  IUser,
  IUserMeeting,
  IUserSettingsUpdate,
} from "../model/User.types";

type RawUser = IUser & {
  suggestPrefill?: boolean;
  availabilityTemplate?: IAvailabilityInterval[];
};

export const normalizeUser = (raw: RawUser): IUser => {
  return {
    ...raw,
    timezone: raw.timezone || "UTC +3:00 (Москва)",
    theme: raw.theme === "dark" ? "dark" : "light",
    suggest_prefill: raw.suggest_prefill ?? raw.suggestPrefill ?? true,
    availability_template: raw.availability_template ?? raw.availabilityTemplate ?? [],
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

export const yandexCallbackRequest = (code: string) => {
  return apiClient.post<ITokenInfo, { code: string }>("/auth/yandex/callback", { code });
};

export const getMeRequest = async () => {
  const user = await apiClient.get<RawUser>("/users/me");
  return normalizeUser(user);
};

export const updateMeRequest = async (payload: IUserSettingsUpdate) => {
  const user = await apiClient.patch<RawUser, IUserSettingsUpdate>("/users/me", payload);
  return normalizeUser(user);
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

export const getMyMeetingsRequest = async () => {
  const data = await apiClient.get<Array<IUserMeeting & { data_range?: [string, string][] }>>("/users/me/meetings");
  return data.map(item => ({
    ...item,
    dataRange: item.dataRange ?? item.data_range ?? [],
  }));
};
