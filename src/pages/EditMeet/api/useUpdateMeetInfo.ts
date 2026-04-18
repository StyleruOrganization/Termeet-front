import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useNavigate } from "react-router";
import { MeetQueries } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { apiClient } from "@/shared/api";
import type { IEditMeetPayload } from "../model/EditMeet.types";

export const useUpdateMeetInfo = (hash: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast, removeToast } = useToastStore();
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startShowLoaderTime = useRef<number>(null);
  return useMutation({
    mutationFn: (data: IEditMeetPayload) => {
      const oldState = queryClient.getQueryData(MeetQueries.meet(hash).queryKey);
      return apiClient.patch(`/meet/${hash}`, {
        dataRange: oldState?.dataRange,
        duration: oldState?.duration,
        link: data.link?.trim(),
        name: data.name.trim(),
        description: data.description?.trim(),
      });
    },
    onMutate: () => {
      toastTimerRef.current = setTimeout(() => {
        startShowLoaderTime.current = Date.now();
        addToast({
          type: "wait",
          message: "Обновляем информацию о встрече",
          id: "wait-meet-update",
        });
      }, 300);
    },
    onError: () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      removeToast("wait-meet-update");
      addToast({
        type: "error",
        message: "Не удалось обновить информацию о встрече",
        id: "error-meet-update",
      });
    },
    onSuccess: async () => {
      if (
        startShowLoaderTime.current &&
        Date.now() - startShowLoaderTime.current > 300 &&
        Date.now() - startShowLoaderTime.current < 800
      ) {
        console.log("Уже успех но ждем еще время в onSuccess");
        await new Promise(resolve =>
          setTimeout(resolve, 800 - (Date.now() - (startShowLoaderTime.current || Date.now()))),
        );
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      queryClient.invalidateQueries(MeetQueries.meet(hash));
      navigate(`/meet/${hash}`);
      removeToast("wait-meet-update");
      addToast({
        id: "update-meet-success",
        message: "Информация о встрече успешно обновлена!",
        type: "success",
      });
    },
  });
};
