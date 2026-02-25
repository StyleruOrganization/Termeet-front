import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Помечаем данные как устаревшие, и если есть активные подписчики по этому ключу, то в фоне (isFetching=true, isLoading=false) происхожит перезапрос
      staleTime: 5 * 60 * 1000,
      // Полное удаление из кеша, и перезапрос в случае необходимости как в первый раз (isLoading=true)
      gcTime: 7 * 60 * 1000,
    },
  },
});
