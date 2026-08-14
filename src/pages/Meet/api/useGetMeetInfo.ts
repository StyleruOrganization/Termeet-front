import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MeetQueries } from "@/entities/Meet";
import { useSessionStore } from "@/entities/User";
import { transformMeetData } from "../lib";
import { useMeetLiveSocket } from "../lib/live/useMeetLiveSocket";
import { useMeetLiveToasts } from "../lib/live/useMeetLiveToasts";

export const useGetMeetInfo = (hash: string, isLocal: boolean) => {
  const userId = useSessionStore(state => state.user?.id ?? "guest");
  useMeetLiveSocket(hash, userId);
  const { data } = useSuspenseQuery({
    ...MeetQueries.meet(hash),
    queryKey: [...MeetQueries.meet(hash).queryKey, userId],
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const transformedMeetData = useMemo(() => {
    console.log("[useGetMeetInfo] raw", { hash, isLocal, userId, data });
    try {
      const result = transformMeetData(data, isLocal, userId === "guest" ? null : userId);
      console.log("[useGetMeetInfo] transformed", {
        name: result.name,
        meeting_days: result.meeting_days,
        timeRanges: result.timeRanges,
        timeInfoSize: result.timeInfo?.size,
        users: result.users,
        finalSlotSize: result.finalSlot?.size,
      });
      return result;
    } catch (error) {
      console.error("[useGetMeetInfo] transform failed", error);
      throw error;
    }
  }, [data, hash, isLocal, userId]);

  useMeetLiveToasts(hash, data, transformedMeetData.mySlotName);

  return {
    meetData: transformedMeetData,
  };
};
