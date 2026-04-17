import { useMutation } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "@/shared/api";
import { meetCreateSchema, type MeetCreate, meetResponseSchema, type MeetResponse } from "@entities/Meet";
import { useToastStore } from "@features/ToastContainer";
import type { ICreateMeet } from "../model";

const prepareDateRanges = (dates: string[], start_time: string, end_time: string) => {
  start_time = start_time.replace(/\s/g, "");
  end_time = end_time.replace(/\s/g, "");

  return dates.map(date => [
    new Date(`${date}T${start_time}:00`).toISOString(),
    new Date(`${date}T${end_time}:00`).toISOString(),
  ]);
};

export const useCreateMeet = ({ onSuccess: onSuccessExternal }: { onSuccess: () => void }) => {
  const navigate = useNavigate();
  const addToast = useToastStore(store => store.addToast);
  const removeToast = useToastStore(store => store.removeToast);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Очистка таймаутов при размонтировании
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  const handleSuccess = (response: MeetResponse) => {
    const validationRes = meetResponseSchema.safeParse(response);
    if (!validationRes.success) {
      console.error("❌ Ошибка валидации данных в ответе при создании встречи:", {
        error: validationRes.error.issues[0].message,
        path: validationRes.error.issues[0].path,
        timestamp: new Date().toISOString(),
      });
    }
    onSuccessExternal();
    navigate(`/meet/${response.hash}`);
    addToast({
      id: "success-create-meet",
      message: "Встреча успешно создана",
      type: "success",
    });
  };

  const handleError = (error: Error) => {
    console.error("Ошибка при создании встречи:", error);
    addToast({
      type: "error",
      message: "Ошибка при создании встречи",
      id: "create-meet-error",
    });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: MeetCreate) => apiClient.post<MeetResponse, MeetCreate>("/meet/create", data, meetCreateSchema),
    onSuccess: (response: MeetResponse) => {
      console.log("SUCCESS");
      // Очищаем таймаут если он был
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      removeToast("create-meet-wait");
      handleSuccess(response);
    },
    onMutate: () => {
      toastTimerRef.current = setTimeout(() => {
        addToast({
          type: "wait",
          message: "Создание встречи...",
          id: "create-meet-wait",
        });
      }, 300);
    },
    onError: (error: Error) => {
      // Очищаем таймаут если он был
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }

      removeToast("create-meet-wait");
      handleError(error);
    },
  });

  const createMeet = (formData: ICreateMeet) => {
    const preparedData: MeetCreate = {
      name: formData.title.trim(),
      description: formData.description?.trim(),
      link: formData.link?.trim() || null,
      duration: formData.timeDuration,
      dataRange: prepareDateRanges(formData.dates, formData.timeStart, formData.timeEnd),
    };

    mutate(preparedData);
  };

  return { createMeet, isPending };
};
