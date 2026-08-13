import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MeetQueries, useMeetStore } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { apiClient, HttpError } from "@/shared/api";

export const useDeleteParticipant = (meetHash: string) => {
  const queryClient = useQueryClient();
  const oldTimeInfo = useMeetStore(store => store.timeInfo);
  const oldUsers = useMeetStore(store => store.users);
  const setUsers = useMeetStore(store => store.setUsers);
  const setTimeInfo = useMeetStore(store => store.setTimeInfo);
  const addToast = useToastStore(state => state.addToast);

  return useMutation({
    mutationFn: (username: string) => {
      return apiClient.delete(`/meet/${meetHash}/slots/${encodeURIComponent(username)}`);
    },
    onMutate: async username => {
      await queryClient.cancelQueries({
        queryKey: MeetQueries.meet(meetHash).queryKey,
      });

      const previousUsers = [...(oldUsers || [])];
      const previousTimeInfo: typeof oldTimeInfo = new Map();

      oldTimeInfo.forEach((inner, date) => {
        previousTimeInfo.set(date, {
          timeRanges: [...inner.timeRanges],
          userSlots: new Map(inner.userSlots),
        });
      });

      const nextTimeInfo: typeof oldTimeInfo = new Map();
      oldTimeInfo.forEach((inner, date) => {
        const userSlots = new Map<string, string[]>();
        inner.userSlots.forEach((users, time) => {
          userSlots.set(
            time,
            users.filter(user => user !== username),
          );
        });
        nextTimeInfo.set(date, {
          timeRanges: [...inner.timeRanges],
          userSlots,
        });
      });

      setUsers(previousUsers.filter(user => user !== username));
      setTimeInfo(nextTimeInfo);

      return { previousUsers, previousTimeInfo };
    },
    onError: (error, _username, context) => {
      if (context) {
        setUsers(context.previousUsers);
        setTimeInfo(context.previousTimeInfo);
      }

      const isForbidden = error instanceof HttpError && error.status === 403;
      addToast({
        type: "error",
        message: isForbidden ? "Удалять участников может только организатор" : "Не получилось удалить участника",
        id: "participant-delete-error",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MeetQueries.meet(meetHash).queryKey,
      });
      addToast({
        type: "success",
        message: "Участник удалён",
        id: "participant-deleted",
      });
    },
  });
};
