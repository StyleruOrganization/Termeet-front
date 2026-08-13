import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MeetQueries } from "@/entities/Meet";
import { useSessionStore } from "@/entities/User";
import { transformMeetData } from "../lib";

export const useGetMeetInfo = (hash: string, isLocal: boolean) => {
  const userId = useSessionStore(state => state.user?.id ?? "guest");
  const { data } = useSuspenseQuery({
    ...MeetQueries.meet(hash),
    queryKey: [...MeetQueries.meet(hash).queryKey, userId],
  });

  const transformedMeetData = useMemo(() => {
    return transformMeetData(data, isLocal, userId === "guest" ? null : userId);
  }, [data, isLocal, userId]);

  return {
    meetData: transformedMeetData,
  };
};
