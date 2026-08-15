import { useEffect } from "react";
import { useLocation } from "react-router";
import { useSessionStore, yandexClientRequest, yandexTokenRequest } from "@/entities/User";
import { useToastStore } from "@/features/ToastContainer";
import { useLoginModalStore } from "@/shared/libs";

const SUGGEST_SCRIPT = "https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js";
const LOGIN_OPEN_CLASS = "termeet-login-open";
const YANDEX_FRAME_RE = /passport\.yandex|oauth\.yandex|id\.yandex|passport-sdk/i;

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

const hideYandexSuggestUi = () => {
  document.querySelectorAll("iframe").forEach(frame => {
    const src = frame.getAttribute("src") || frame.src || "";
    if (YANDEX_FRAME_RE.test(src)) {
      frame.remove();
    }
  });
};

const readExpiresIn = (value: SuggestPayload["expires_in"]) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

export const useYandexSuggest = () => {
  const { pathname } = useLocation();
  const isLoginOpen = useLoginModalStore(state => state.isOpen);
  const closeLogin = useLoginModalStore(state => state.close);
  const status = useSessionStore(state => state.status);
  const applyAccessToken = useSessionStore(state => state.applyAccessToken);
  const addToast = useToastStore(state => state.addToast);
  const canShowWidget = status === "anonymous" && pathname === "/";

  useEffect(() => {
    document.body.classList.toggle(LOGIN_OPEN_CLASS, isLoginOpen);
    return () => {
      document.body.classList.remove(LOGIN_OPEN_CLASS);
    };
  }, [isLoginOpen]);

  useEffect(() => {
    if (!canShowWidget) {
      hideYandexSuggestUi();
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
        await applyAccessToken(tokens.access_token);
        closeLogin();
        hideYandexSuggestUi();
        addToast({
          id: "auth-success",
          type: "success",
          message: "Вы вошли через Яндекс",
        });
      } catch {
        return;
      }
    };

    start();

    return () => {
      cancelled = true;
      hideYandexSuggestUi();
    };
  }, [addToast, applyAccessToken, canShowWidget, closeLogin]);
};
