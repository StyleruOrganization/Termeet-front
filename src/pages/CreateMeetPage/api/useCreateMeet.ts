import { useMutation } from "@tanstack/react-query";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { apiClient } from "@/shared/api";
import { meetCreateSchema, type MeetCreate, meetResponseSchema, type MeetResponse } from "@entities/Meet";
import { useToastStore } from "@features/ToastContainer";
import type { ICreateMeet } from "../model";

function parseDuration(duration?: string): string | null {
  if (!duration) {
    return null;
  }
  const cleanText = duration.toLowerCase().trim();

  let hours = 0;
  let minutes = 0;

  const hoursMatch = cleanText.match(/(\d+)\s*ч/);
  if (hoursMatch) {
    hours = parseInt(hoursMatch[1], 10);
  }

  const minutesMatch = cleanText.match(/(\d+)\s*мин/);
  if (minutesMatch) {
    minutes = parseInt(minutesMatch[1], 10);
  }

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
}

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
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastShowTimeRef = useRef<number | null>(null);
  const pendingResponseRef = useRef<{ response?: MeetResponse; error?: Error } | null>(null);
  const hideToastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Очистка таймаутов при размонтировании
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (hideToastTimeoutRef.current) {
        clearTimeout(hideToastTimeoutRef.current);
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
    navigate(`/meet/${response.hash}`, {
      state: {
        showToast: true,
        toastMessage: "Встреча успешно создана",
        toastId: "create-meet-success",
      },
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

  const processPendingResponse = () => {
    if (pendingResponseRef.current) {
      const { response, error } = pendingResponseRef.current;
      if (response) {
        handleSuccess(response);
      } else if (error) {
        handleError(error);
      }
      pendingResponseRef.current = null;
    }
    toastShowTimeRef.current = null;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data: MeetCreate) => apiClient.post<MeetResponse, MeetCreate>("/meet/create", data, meetCreateSchema),
    onSuccess: (response: MeetResponse) => {
      if (!toastShowTimeRef.current) {
        handleSuccess(response);
      } else {
        pendingResponseRef.current = { response };

        const elapsed = Date.now() - toastShowTimeRef.current;
        const remaining = Math.max(0, 500 - elapsed);

        if (remaining > 0) {
          if (hideToastTimeoutRef.current) {
            clearTimeout(hideToastTimeoutRef.current);
          }
          hideToastTimeoutRef.current = setTimeout(() => {
            removeToast("create-meet-wait");
            processPendingResponse();
            hideToastTimeoutRef.current = null;
          }, remaining);
        } else {
          removeToast("create-meet-wait");
          processPendingResponse();
        }
      }
    },
    onMutate: () => {
      toastTimeoutRef.current = setTimeout(() => {
        addToast({
          type: "wait",
          message: "Создание встречи...",
          id: "create-meet-wait",
        });
        toastShowTimeRef.current = Date.now();
        toastTimeoutRef.current = null;

        hideToastTimeoutRef.current = setTimeout(() => {
          removeToast("create-meet-wait");
          processPendingResponse();
          hideToastTimeoutRef.current = null;
        }, 500);
      }, 300);
    },
    onError: (error: Error) => {
      if (!toastShowTimeRef.current) {
        if (toastTimeoutRef.current) {
          clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = null;
        }
        handleError(error);
      } else {
        pendingResponseRef.current = { error };

        if (hideToastTimeoutRef.current) {
          clearTimeout(hideToastTimeoutRef.current);
        }

        hideToastTimeoutRef.current = setTimeout(() => {
          removeToast("create-meet-wait");
          processPendingResponse();
          hideToastTimeoutRef.current = null;
        }, 0);
      }
    },
  });

  const createMeet = (formData: ICreateMeet) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    if (hideToastTimeoutRef.current) {
      clearTimeout(hideToastTimeoutRef.current);
      hideToastTimeoutRef.current = null;
    }
    toastShowTimeRef.current = null;
    pendingResponseRef.current = null;

    const preparedData: MeetCreate = {
      name: formData.title.trim(),
      description: formData.description?.trim(),
      link: formData.link?.trim() || null,
      duration: parseDuration(formData.timeDuration),
      dataRange: prepareDateRanges(formData.dates, formData.timeStart, formData.timeEnd),
    };

    mutate(preparedData);
  };

  return { createMeet, isPending };
};
