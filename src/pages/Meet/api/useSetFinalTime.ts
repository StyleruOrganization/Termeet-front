import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MeetQueries, useMeetStore } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { apiClient, HttpError } from "@/shared/api";
import { useTranslation } from "@/shared/i18n";
import { suppressMeetLiveToasts } from "../lib";
import type { MeetResponse } from "@/entities/Meet";

export const useSetFinalTime = (hash: string, isEdit = false) => {
  const queryClient = useQueryClient();
  const getPreparedNewSlots = useMeetStore(store => store.getPreparedNewSlots);
  const setIsEditing = useMeetStore(store => store.setIsEditing);
  const clearNewSelectedSlots = useMeetStore(store => store.clearNewSelectedSlots);
  const addToast = useToastStore(state => state.addToast);
  const removeToast = useToastStore(state => state.removeToast);
  const { t } = useTranslation();

  return useMutation({
    mutationFn: () => {
      suppressMeetLiveToasts(hash);
      return apiClient.patch<MeetResponse, { slots: [string, string][] }>(`/meet/${hash}/final`, {
        slots: getPreparedNewSlots(),
      });
    },
    onSuccess: () => {
      clearNewSelectedSlots();
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: MeetQueries.meet(hash).queryKey });
      removeToast("final-hint");
      addToast({
        id: `meet-final-success-${Date.now()}`,
        type: "success",
        duration: 6000,
        message: isEdit ? t("toast.finalUpdated") : t("toast.finalSet"),
      });
    },
    onError: (error: Error) => {
      const isDuration =
        error instanceof HttpError && error.status === 400 && error.detail?.toLowerCase().includes("duration");
      const isBadSlot = error instanceof HttpError && error.status === 400;
      addToast({
        id: `meet-final-error-${Date.now()}`,
        type: "error",
        duration: 6000,
        message: isDuration
          ? "Итоговое время не может быть длиннее продолжительности встречи"
          : isBadSlot
            ? "Итоговое время должно быть в один день и среди уже выбранных слотов"
            : isEdit
              ? "Не получилось изменить время"
              : "Не получилось назначить время",
      });
    },
  });
};
