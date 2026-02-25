import { queryOptions } from "@tanstack/react-query";
import { getMeet } from "./getMeet";

export const MeetQueries = {
  generallKey: ["posts"],
  meet: (hash: string) =>
    queryOptions({
      queryKey: [...MeetQueries.generallKey, hash],
      queryFn: () => getMeet(hash),
      enabled: !!hash,
    }),
};
