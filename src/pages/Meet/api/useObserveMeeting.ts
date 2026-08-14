import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MeetQueries } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { apiClient } from "@/shared/api";
import { suppressMeetLiveToasts } from "../lib";
import type { MeetResponse } from "@/entities/Meet";

export const useObserveMeeting = (hash: string) => {
  const queryClient = useQueryClient();
  const addToast = useToastStore(state => state.addToast);

  return useMutation({
    mutationFn: () => {
      suppressMeetLiveToasts(hash);
      return apiClient.post<MeetResponse>(`/meet/${hash}/observe`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MeetQueries.meet(hash).queryKey });
      addToast({
        id: "meet-observe-success",
        type: "success",
        message: "Вы наблюдатель этой встречи",
      });
    },
    onError: () => {
      addToast({
        id: "meet-observe-error",
        type: "error",
        message: "Не получилось стать наблюдателем",
      });
    },
  });
};
