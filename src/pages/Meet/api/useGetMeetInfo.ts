import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { MeetQueries } from "@/entities/Meet";
import { transformMeetData } from "../lib";

export const useGetMeetInfo = (hash: string, isLocal: boolean) => {
  const { data } = useSuspenseQuery(MeetQueries.meet(hash));

  // Используем useMemo для автоматического пересчета при изменении isLocal
  const transformedMeetData = useMemo(() => {
    return transformMeetData(data, isLocal);
  }, [data, isLocal]);

  return {
    meetData: transformedMeetData,
  };
};
