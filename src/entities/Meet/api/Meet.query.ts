import { queryOptions } from "@tanstack/react-query";
import { getMeet } from "./getMeet";

export const MeetQueries = {
  generallKey: ["meet"],
  meet: (hash?: string) =>
    queryOptions({
      queryKey: [...MeetQueries.generallKey, hash],
      queryFn: () => getMeet(hash),
      enabled: !!hash,
      retry: 1,
    }),
};
