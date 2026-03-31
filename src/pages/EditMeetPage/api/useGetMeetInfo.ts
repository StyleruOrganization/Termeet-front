import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
import { MeetQueries, type IMeet } from "@/entities/Meet";
import { convertUTCToTimezone } from "@/shared/libs";

export const useGetMeetInfo = (): Pick<IMeet, "name" | "description" | "link" | "timeRanges" | "duration"> => {
  const { hash = "" } = useParams();
  const { data: meetData } = useSuspenseQuery(MeetQueries.meet(hash));
  const [searchParams] = useSearchParams();
  const isLocalTime = searchParams.get("localTime") === "true" || searchParams.get("localTime") == null;
  const timeZoneOffset = isLocalTime ? -new Date().getTimezoneOffset() / 60 : 5;
  const timeRanges: IMeet["timeRanges"] = [];

  const preparedMeetDataDataRanges = meetData.dataRange.map(([startTime, endTime]) => [
    convertUTCToTimezone(startTime, timeZoneOffset),
    convertUTCToTimezone(endTime, timeZoneOffset),
  ]);

  preparedMeetDataDataRanges.forEach(([startTimeRange, endTimeRange]) => {
    const [startDate, startTime] = startTimeRange.split("T");
    const [endDate, endTime] = endTimeRange.split("T");

    const processedStartTime = startTime.split(":").slice(0, 2).join(":");
    const processedEndTime = endTime.split(":").slice(0, 2).join(":");

    // Произошел переход, из-за часового пояса
    if (startDate !== endDate) {
      if (timeRanges.length === 0) {
        timeRanges.push([processedStartTime, "00:00"]);
        timeRanges.push(["00:00", processedEndTime]);
      }
    } else {
      if (timeRanges.length === 0) {
        timeRanges.push([processedStartTime, processedEndTime]);
      }
    }
  });

  return {
    name: meetData.name,
    description: meetData.description || "",
    link: meetData.link || "",
    timeRanges,
    duration: meetData.duration || "",
  };
};
