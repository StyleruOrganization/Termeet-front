import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMeetStore, MeetQueries } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { apiClient, HttpError } from "@/shared/api";

interface ISaveSlotsPayload {
  name: string;
  isEdit?: boolean;
}

type TimeInfo = Map<
  string,
  {
    timeRanges: [string, string][];
    userSlots: Map<string, string[]>;
  }
>;

const cloneTimeInfo = (source: TimeInfo): TimeInfo => {
  const copy: TimeInfo = new Map();
  source.forEach((inner, date) => {
    copy.set(date, {
      timeRanges: [...inner.timeRanges],
      userSlots: new Map(inner.userSlots),
    });
  });
  return copy;
};

export const useSaveUserSelectedSlots = (meetHash: string, onMutate?: () => void) => {
  const queryClient = useQueryClient();
  const getNewSelectedSlots = useMeetStore(state => state.getNewSelectedSlots);
  const getPreparedNewSlots = useMeetStore(store => store.getPreparedNewSlots);
  const clearNewSelectedSlots = useMeetStore(store => store.clearNewSelectedSlots);
  const oldTimeInfo = useMeetStore(store => store.timeInfo);
  const oldUsers = useMeetStore(store => store.users);
  const setUsers = useMeetStore(store => store.setUsers);
  const setTimeInfo = useMeetStore(store => store.setTimeInfo);
  const setTimeIsAdded = useMeetStore(store => store.setTimeIsAdded);
  const addToast = useToastStore(state => state.addToast);

  return useMutation({
    mutationFn: async ({ name, isEdit }: ISaveSlotsPayload) => {
      const preparedSlots = getPreparedNewSlots();
      clearNewSelectedSlots();
      const endpoint = isEdit ? `/meet/${meetHash}/slots/edit` : `/meet/${meetHash}/slots`;

      await apiClient.patch(endpoint, { name, slots: preparedSlots });
      return { empty: preparedSlots.length === 0 };
    },
    onMutate: async ({ name, isEdit }) => {
      await queryClient.cancelQueries({
        queryKey: MeetQueries.meet(meetHash).queryKey,
      });

      const previousState = {
        users: [...(oldUsers || [])],
        timeInfo: cloneTimeInfo(oldTimeInfo),
      };

      const newTimeInfo = cloneTimeInfo(oldTimeInfo);

      if (isEdit) {
        newTimeInfo.forEach(inner => {
          inner.userSlots.forEach((users, time) => {
            inner.userSlots.set(
              time,
              users.filter(user => user !== name),
            );
          });
        });
      }

      const newSelectedEntries = Array.from(getNewSelectedSlots().entries());

      for (const [date, times] of newSelectedEntries) {
        const dateInfo = newTimeInfo.get(date);

        if (!dateInfo) {
          throw new Error(`No date ${date}`);
        }

        for (const time of times) {
          if (!dateInfo.userSlots.has(time)) {
            dateInfo.userSlots.set(time, []);
          }
          dateInfo.userSlots.set(time, [...(dateInfo.userSlots.get(time) || []), name]);
        }

        newTimeInfo.set(date, dateInfo);
      }

      const newSelectedEntries = Array.from(getNewSelectedSlots().entries());
      const hasSlots = newSelectedEntries.some(([, times]) => times.length > 0);

      setUsers(
        isEdit && !hasSlots
          ? oldUsers.filter(user => user !== name)
          : isEdit || oldUsers.includes(name)
            ? [...(oldUsers || [])]
            : [...(oldUsers || []), name],
      );
      setTimeInfo(newTimeInfo);
      setTimeIsAdded();
      onMutate?.();

      return { previousData: previousState };
    },
    onError: (error, _payload, context) => {
      if (context?.previousData) {
        setTimeInfo(context.previousData.timeInfo);
        setUsers(context.previousData.users);
      }

      const isForbidden = error instanceof HttpError && error.status === 403;
      addToast({
        type: "error",
        message: isForbidden
          ? "Не получилось сохранить слоты. Возможно, это время уже записано"
          : "Ошибка при сохранении выбранных временных слотов",
        id: "slots-update-error",
      });
    },
    onSuccess: (data, payload) => {
      queryClient.invalidateQueries({
        queryKey: MeetQueries.meet(meetHash).queryKey,
      });
      addToast({
        type: "success",
        message: payload.isEdit
          ? data.empty
            ? "Вы больше не в списке проголосовавших"
            : "Ваше время обновлено"
          : "Выбранные временные слоты успешно сохранены",
        id: "slots-updated",
      });
    },
  });
};
