import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MeetQueries, useMeetStore } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { apiClient, HttpError } from "@/shared/api";
import type { MeetResponse } from "@/entities/Meet";

export const useSetFinalTime = (hash: string) => {
  const queryClient = useQueryClient();
  const getPreparedNewSlots = useMeetStore(store => store.getPreparedNewSlots);
  const setIsEditing = useMeetStore(store => store.setIsEditing);
  const clearNewSelectedSlots = useMeetStore(store => store.clearNewSelectedSlots);
  const addToast = useToastStore(store => store.addToast);

  return useMutation({
    mutationFn: () => {
      return apiClient.patch<MeetResponse, { slots: [string, string][] }>(`/meet/${hash}/final`, {
        slots: getPreparedNewSlots(),
      });
    },
    onSuccess: () => {
      clearNewSelectedSlots();
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: MeetQueries.meet(hash).queryKey });
      addToast({
        id: "meet-final-success",
        type: "success",
        message: "Итоговое время назначено. Новые слоты больше не принимают",
      });
    },
    onError: (error: Error) => {
      addToast({
        id: "meet-final-error",
        type: "error",
        message:
          error instanceof HttpError && error.status === 400
            ? "Итоговое время должно быть в один день и среди уже выбранных слотов"
            : "Не получилось назначить время",
      });
    },
  });
};
