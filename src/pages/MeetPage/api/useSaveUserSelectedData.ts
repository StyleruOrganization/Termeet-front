import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMeetStore, slotsUserSchema, MeetQueries } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { apiClient } from "@/shared/api";

export const useSaveUserSelectedData = (meetHash: string, onMutate?: () => void) => {
  const queryClient = useQueryClient();
  const getNewSelectedSlots = useMeetStore(state => state.getNewSelectedSlots);
  const getPreparedNewSlots = useMeetStore(store => store.getPreparedNewSlots);
  const clearNewSelectedSlots = useMeetStore(store => store.clearNewSelectedSlots);
  const addToast = useToastStore(state => state.addToast);

  return useMutation({
    mutationFn: async (userName: string) => {
      const newSelections = getPreparedNewSlots();
      clearNewSelectedSlots();
      console.log("Saving user selected slots to server", { userName, newSelections });

      return await apiClient.post(
        `/meets/slots/${meetHash}`,
        { name: userName, slots: newSelections.slots },
        slotsUserSchema,
      );
    },
    // Оптимистичное обновление
    onMutate: async userName => {
      console.log("🚀 Optimistically updating slots for user in onMutate:", userName);

      await queryClient.cancelQueries({
        queryKey: MeetQueries.meet(meetHash).queryKey,
      });

      // Сохраняем предыдущее состояние
      const previousData = queryClient.getQueryData(MeetQueries.meet(meetHash).queryKey);

      // Глубокое копирование timeInfo
      const oldTimeInfo: Map<
        string,
        {
          timeRanges: [string, string][];
          userSlots: Map<string, string[]>;
        }
      > = new Map();
      if (previousData?.timeInfo) {
        previousData.timeInfo.forEach((inner, date) => {
          const innerCopy = {
            timeRanges: [...inner.timeRanges],
            userSlots: new Map(),
          };
          inner.userSlots.forEach((users, time) => {
            innerCopy.userSlots.set(time, [...users]); // Копируем массив
          });
          oldTimeInfo.set(date, innerCopy);
        });
      }

      const previousState = {
        users: [...(previousData?.users || [])],
        timeInfo: oldTimeInfo,
      };

      console.log("Previous data from cache before optimistic update:", previousState);

      // Создаем новую timeInfo для обновления
      const newTimeInfo: Map<
        string,
        {
          timeRanges: [string, string][];
          userSlots: Map<string, string[]>;
        }
      > = new Map();
      if (previousData?.timeInfo) {
        previousData.timeInfo.forEach((inner, date) => {
          const innerCopy = {
            timeRanges: [...inner.timeRanges],
            userSlots: new Map(),
          };
          inner.userSlots.forEach((users, time) => {
            innerCopy.userSlots.set(time, [...users]); // Копируем массив
          });
          newTimeInfo.set(date, innerCopy);
        });
      }

      const newSelectedEntries = Array.from(getNewSelectedSlots().entries());

      if (previousData) {
        for (const [date, times] of newSelectedEntries) {
          const oldDateInfo = newTimeInfo.get(date);

          if (!oldDateInfo) {
            throw new Error(`No date ${date}`);
          }

          if (!oldDateInfo.userSlots) {
            oldDateInfo.userSlots = new Map();
          }

          for (const time of times) {
            if (!oldDateInfo.userSlots?.has(time)) {
              oldDateInfo.userSlots?.set(time, []);
            }
            oldDateInfo.userSlots?.set(time, [...(oldDateInfo.userSlots?.get(time) || []), userName]);
          }
        }
      }

      // Обновляем кеш React Query
      console.log("Updating React Query cache with new user and slots", {
        timeInfo: newTimeInfo,
      });

      queryClient.setQueryData(MeetQueries.meet(meetHash).queryKey, old => {
        if (!old) return old;

        return {
          ...old,
          users: [...old.users, userName],
          timeInfo: newTimeInfo,
        };
      });

      console.log("Execute callback after optimistic update from props");
      onMutate?.();

      return { previousData: previousState };
    },

    onError: (_, _2, context) => {
      if (context?.previousData) {
        console.log("Rolling back changes due to error with data from context", context.previousData);
        addToast({
          type: "error",
          message: "Ошибка при сохранении выбранных временных слотов",
          id: "slots-update-error",
        });
        // Откатываем React Query кеш
        queryClient.setQueryData(MeetQueries.meet(meetHash).queryKey, old => {
          if (!old) return old;

          return {
            ...old,
            ...context.previousData,
          };
        });
      }
    },

    // При успехе - инвалидируем для синхронизации с сервером
    onSuccess: () => {
      console.log("invalidateQueries in onSuccess to refetch updated data from server");
      // queryClient.invalidateQueries({
      //   queryKey: MeetQueries.meet(meetHash).queryKey,
      // });
      addToast({
        type: "success",
        message: "Выбранные временные слоты успешно сохранены",
        id: "slots-updated",
      });

      console.log("🎉 Slots updated successfully on the server");
    },
  });
};
