import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { confirmEmailRequest } from "@/entities/User";
import { Loader } from "@/shared/ui";
import { useToastStore } from "@features/ToastContainer";

export const AuthConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const addToast = useToastStore(state => state.addToast);
  const startedRef = useRef(false);
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      addToast({
        id: "email-confirm-error",
        type: "error",
        message: "Не хватает ссылки для подтверждения почты",
      });
      navigate("/", { replace: true });
      return;
    }

    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    const confirm = async () => {
      try {
        await confirmEmailRequest(token);
        addToast({
          id: "email-confirm-success",
          type: "success",
          message: "Почта подтверждена",
        });
      } catch {
        addToast({
          id: "email-confirm-error",
          type: "error",
          message: "Ссылка недействительна или устарела",
        });
      } finally {
        navigate("/", { replace: true });
      }
    };

    confirm();
  }, [addToast, navigate, token]);

  return <Loader message='Подтверждаем почту...' />;
};
