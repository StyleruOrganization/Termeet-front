import { useEffect } from "react";
import { yandexClientRequest, yandexTokenRequest } from "@/entities/User";
import { useLoginModalStore } from "@/shared/libs";

const SUGGEST_SCRIPT = "https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js";

type SuggestPayload = {
  access_token?: string;
  expires_in?: string | number;
};

type YaAuthSuggestApi = {
  init: (
    oauthQueryParams: Record<string, string>,
    tokenPageOrigin: string,
  ) => Promise<{
    status?: string;
    handler: () => Promise<SuggestPayload>;
  }>;
};

const loadScript = (src: string) => {
  const existing = document.querySelector(`script[src="${src}"]`);
  if (existing) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("yandex suggest script"));
    document.head.appendChild(script);
  });
};

const readExpiresIn = (value: SuggestPayload["expires_in"]) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const useYandexSuggest = (onLoggedIn: (accessToken: string) => Promise<void>) => {
  const isOpen = useLoginModalStore(state => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const start = async () => {
      try {
        const client = await yandexClientRequest();
        await loadScript(SUGGEST_SCRIPT);
        if (cancelled) {
          return;
        }

        const api = (window as Window & { YaAuthSuggest?: YaAuthSuggestApi }).YaAuthSuggest;
        if (!api) {
          return;
        }

        const result = await api.init(
          {
            client_id: client.client_id,
            response_type: "token",
            redirect_uri: `${window.location.origin}/yandex-suggest.html`,
            scope: client.scope,
          },
          window.location.origin,
        );
        const payload = await result.handler();
        if (cancelled || !payload?.access_token) {
          return;
        }

        const tokens = await yandexTokenRequest(payload.access_token, readExpiresIn(payload.expires_in));
        if (cancelled) {
          return;
        }
        await onLoggedIn(tokens.access_token);
      } catch {
        return;
      }
    };

    start();

    return () => {
      cancelled = true;
    };
  }, [isOpen, onLoggedIn]);
};
