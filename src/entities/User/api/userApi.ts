import { apiClient } from "@/shared/api";
import type { ILoginPayload, IRegisterPayload, ITokenInfo, IUser } from "../model/User.types";

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

export const getMeRequest = () => {
  return apiClient.get<IUser>("/users/me");
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
