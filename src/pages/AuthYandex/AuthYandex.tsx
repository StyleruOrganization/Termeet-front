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

  useEffect(() => {
    if (error || !code) {
      addToast({
        id: "yandex-auth-error",
        type: "error",
        message: "Не получилось войти через Яндекс",
      });
      navigate("/", { replace: true });
      return;
    }

    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const exchange = async () => {
      try {
        const tokens = await yandexCallbackRequest(code);
        await applyAccessToken(tokens.access_token);
        addToast({
          id: "yandex-auth-success",
          type: "success",
          message: "Вы вошли через Яндекс",
        });
      } catch {
        addToast({
          id: "yandex-auth-error",
          type: "error",
          message: "Не получилось войти через Яндекс",
        });
      } finally {
        navigate("/", { replace: true });
      }
    };

    exchange();
  }, [addToast, applyAccessToken, code, error, navigate]);

  return <Loader message='Входим через Яндекс...' />;
};
