import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { MeetQueries } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { apiClient } from "@/shared/api";
import type { IEditMeetPayload } from "../model/EditMeet.types";

export const useUpdateMeetInfo = (hash: string) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToastStore();
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
    onError: () => {
      addToast({
        type: "error",
        message: "Не удалось обновить информацию о встрече",
        id: "error-meet-update",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(MeetQueries.meet(hash));
      navigate(`/meet/${hash}`);
      addToast({
        id: "update-meet-success",
        message: "Информация о встрече успешно обновлена!",
        type: "success",
      });
    },
  });
};
