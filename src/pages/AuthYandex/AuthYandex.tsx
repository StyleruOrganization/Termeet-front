import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useSessionStore, yandexCallbackRequest } from "@/entities/User";
import { Loader } from "@/shared/ui";
import { useToastStore } from "@features/ToastContainer";

export const AuthYandex = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const applyAccessToken = useSessionStore(state => state.applyAccessToken);
  const addToast = useToastStore(state => state.addToast);
  const startedRef = useRef(false);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");
  const isLink = state === "link";

  useEffect(() => {
    if (error || !code) {
      addToast({
        id: "yandex-auth-error",
        type: "error",
        message: isLink ? "Не получилось привязать Яндекс" : "Не получилось войти через Яндекс",
      });
      navigate(isLink ? "/profile?tab=integrations" : "/", { replace: true });
      return;
    }

    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const exchange = async () => {
      try {
        const tokens = await yandexCallbackRequest(code, state);
        await applyAccessToken(tokens.access_token);
        addToast({
          id: "yandex-auth-success",
          type: "success",
          message: isLink ? "Яндекс привязан к аккаунту" : "Вы вошли через Яндекс",
        });
        navigate(isLink ? "/profile?tab=integrations" : "/", { replace: true });
      } catch {
        addToast({
          id: "yandex-auth-error",
          type: "error",
          message: isLink ? "Не получилось привязать Яндекс" : "Не получилось войти через Яндекс",
        });
        navigate(isLink ? "/profile?tab=integrations" : "/", { replace: true });
      }
    };

    exchange();
  }, [addToast, applyAccessToken, code, error, isLink, navigate, state]);

  return <Loader message={isLink ? "Привязываем Яндекс..." : "Входим через Яндекс..."} />;
};
