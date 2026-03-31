import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMeetStore, slotsUserSchema, MeetQueries } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { apiClient } from "@/shared/api";

export const useSaveUserSelectedSlots = (meetHash: string, onMutate?: () => void) => {
  const queryClient = useQueryClient();
  const getNewSelectedSlots = useMeetStore(state => state.getNewSelectedSlots),
    getPreparedNewSlots = useMeetStore(store => store.getPreparedNewSlots),
    clearNewSelectedSlots = useMeetStore(store => store.clearNewSelectedSlots),
    oldTimeInfo = useMeetStore(store => store.timeInfo),
    oldUsers = useMeetStore(store => store.users),
    setUsers = useMeetStore(store => store.setUsers),
    setTimeInfo = useMeetStore(store => store.setTimeInfo);

  const addToast = useToastStore(state => state.addToast);

  return useMutation({
    mutationFn: async (userName: string) => {
      const preparedSlots = getPreparedNewSlots();
      clearNewSelectedSlots();

      return await apiClient.patch(
        `/meet/${meetHash}/slots`,
        { name: userName, slots: preparedSlots },
        slotsUserSchema,
      );
    },
    // Оптимистичное обновление
    onMutate: async userName => {
      await queryClient.cancelQueries({
        queryKey: MeetQueries.meet(meetHash).queryKey,
      });

      // Глубокое копирование timeInfo

      const oldTimeInfoCopy: Map<
        string,
        {
          timeRanges: [string, string][];
          userSlots: Map<string, string[]>;
        }
      > = new Map();

      if (oldTimeInfo.size) {
        oldTimeInfo.forEach((inner, date) => {
          oldTimeInfoCopy.set(date, {
            timeRanges: [...inner.timeRanges],
            userSlots: new Map(inner.userSlots), // Копируем Map
          });
        });
      }

      const previousState = {
        users: [...(oldUsers || [])],
        timeInfo: oldTimeInfoCopy,
      };

      // Создаем новую timeInfo для обновления
      const newTimeInfo: Map<
        string,
        {
          timeRanges: [string, string][];
          userSlots: Map<string, string[]>;
        }
      > = new Map();

      oldTimeInfo.forEach((inner, date) => {
        const innerCopy = {
          timeRanges: [...inner.timeRanges],
          userSlots: new Map(),
        };
        inner.userSlots.forEach((users, time) => {
          innerCopy.userSlots.set(time, [...users]); // Копируем массив
        });
        newTimeInfo.set(date, innerCopy);
      });

      const newSelectedEntries = Array.from(getNewSelectedSlots().entries());

      for (const [date, times] of newSelectedEntries) {
        const dateInfo = newTimeInfo.get(date);

        if (!dateInfo) {
          throw new Error(`No date ${date}`);
        }

        if (!dateInfo.userSlots) {
          dateInfo.userSlots = new Map();
        }

        for (const time of times) {
          if (!dateInfo.userSlots?.has(time)) {
            dateInfo.userSlots?.set(time, []);
          }
          dateInfo.userSlots?.set(time, [...(dateInfo.userSlots?.get(time) || []), userName]);
        }

        newTimeInfo.set(date, dateInfo);
      }

      setUsers([...(oldUsers || []), userName]);
      setTimeInfo(newTimeInfo);
      onMutate?.();

      return { previousData: previousState };
    },

    onError: (_, _2, context) => {
      if (context?.previousData) {
        addToast({
          type: "error",
          message: "Ошибка при сохранении выбранных временных слотов",
          id: "slots-update-error",
        });
        // Откатываем стор
        setTimeInfo(context.previousData.timeInfo);
        setUsers(context.previousData.users);
      }
    },

    // При успехе - инвалидируем кеш React Query для синхронизации с сервером
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MeetQueries.meet(meetHash).queryKey,
      });
      addToast({
        type: "success",
        message: "Выбранные временные слоты успешно сохранены",
        id: "slots-updated",
      });
    },
  });
};
