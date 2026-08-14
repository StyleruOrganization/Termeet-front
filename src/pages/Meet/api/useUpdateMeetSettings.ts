import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MeetQueries } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { apiClient } from "@/shared/api";
import { suppressMeetLiveToasts } from "../lib";
import type { MeetResponse, MeetSettingsUpdate } from "@/entities/Meet";

export const useUpdateMeetSettings = (hash: string) => {
  const queryClient = useQueryClient();
  const addToast = useToastStore(state => state.addToast);

  return useMutation({
    mutationFn: (settings: MeetSettingsUpdate) => {
      suppressMeetLiveToasts(hash);
      return apiClient.patch<MeetResponse, MeetSettingsUpdate>(`/meet/${hash}/settings`, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MeetQueries.meet(hash).queryKey });
      addToast({
        id: "meet-settings-updated",
        type: "success",
        message: "Настройки встречи сохранены",
      });
    },
    onError: () => {
      addToast({
        id: "meet-settings-error",
        type: "error",
        message: "Не получилось сохранить настройки",
      });
    },
  });
};
