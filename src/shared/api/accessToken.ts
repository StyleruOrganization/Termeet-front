let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;
let onUnauthorized: (() => void) | null = null;

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setOnUnauthorized = (callback: (() => void) | null) => {
  onUnauthorized = callback;
};

export const notifyUnauthorized = () => {
  accessToken = null;
  onUnauthorized?.();
};

const SKIP_REFRESH_PREFIXES = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/yandex", "/auth/logout"];

export const shouldAttemptRefresh = (endpoint: string) => {
  return !SKIP_REFRESH_PREFIXES.some(prefix => endpoint.startsWith(prefix));
};

export const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const data: { access_token?: string } = await response.json();
      if (!data.access_token) {
        return false;
      }

      setAccessToken(data.access_token);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};
