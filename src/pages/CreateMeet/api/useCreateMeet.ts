import { useMutation } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "@/shared/api";
import { type MeetCreate, type MeetResponse } from "@entities/Meet";
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
  const startShowLoaderTime = useRef<number>(null);

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
    onSuccessExternal();
    navigate(`/meet/${response.hash}`);
    removeToast("create-meet-wait");
    addToast({
      id: "create-meet-success",
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
    mutationFn: (data: MeetCreate) => apiClient.post<MeetResponse, MeetCreate>("/meet/create", data),
    onSuccess: async (response: MeetResponse) => {
      //t.me/mikhailnaer/775 - используем правильно 300/500
      if (
        startShowLoaderTime.current &&
        Date.now() - startShowLoaderTime.current > 300 &&
        Date.now() - startShowLoaderTime.current < 800
      ) {
        await new Promise(resolve =>
          setTimeout(resolve, 800 - (Date.now() - (startShowLoaderTime.current || Date.now()))),
        );
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      handleSuccess(response);
    },
    onMutate: () => {
      toastTimerRef.current = setTimeout(() => {
        startShowLoaderTime.current = Date.now();
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
