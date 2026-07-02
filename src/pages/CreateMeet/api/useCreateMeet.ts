import { useMutation } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "@/shared/api";
import { type MeetCreate, type MeetResponse } from "@entities/Meet";
import { useToastStore } from "@features/ToastContainer";
import type { ICreateMeet } from "../model";

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const prepareDateRanges = (datesIntervals: ICreateMeet["dates"], start_time: string, end_time: string) => {
  const dates: Date[] = [];

  datesIntervals.forEach(({ start, end }) => {
    const current = new Date(start);
    const endDate = new Date(end);

    current.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  });

  const normalizedStartTime = start_time.replace(/\s/g, "");
  const normalizedEndTime = end_time.replace(/\s/g, "");

  return dates.map(date => {
    const dateStr = formatLocalDate(date);

    const startDateTime = new Date(`${dateStr}T${normalizedStartTime}:00`);
    const endDateTime = new Date(`${dateStr}T${normalizedEndTime}:00`);

    return [startDateTime.toISOString(), endDateTime.toISOString()];
  });
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

    console.log("preparedData", preparedData);

    mutate(preparedData);
  };

  return { createMeet, isPending };
};
