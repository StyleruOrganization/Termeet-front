import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams, useSearchParams } from "react-router";
import { MeetQueries, getMeetDateRange, type IMeet, type InvitedUser } from "@/entities/Meet";
import { useSessionStore } from "@/entities/User";
import { convertUTCToTimezone } from "@/shared/libs";

const invitedName = (item: InvitedUser) => `${item.first_name} ${item.last_name}`.trim();

export const useGetMeetInfo = (): Pick<
  IMeet,
  "name" | "description" | "link" | "timeRanges" | "duration" | "isCreator" | "isCreatorAuth" | "permissions"
> & {
  isClosed: boolean;
  inviteOnlyVote: boolean;
  invitedUsers: { id: string; name: string; hasAvatar?: boolean }[];
} => {
  const { hash = "" } = useParams();
  const userId = useSessionStore(state => state.user?.id ?? "guest");
  const { data: meetData } = useSuspenseQuery({
    ...MeetQueries.meet(hash),
    queryKey: [...MeetQueries.meet(hash).queryKey, userId],
  });
  const [searchParams] = useSearchParams();
  const isLocalTime = searchParams.get("localTime") === "true" || searchParams.get("localTime") == null;
  const timeZoneOffset = isLocalTime ? -new Date().getTimezoneOffset() / 60 : 3;
  const timeRanges: IMeet["timeRanges"] = [];

  const preparedMeetDataDataRanges = getMeetDateRange(meetData).map(([startTime, endTime]) => [
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

  const invitedRaw = meetData.invitedUsers ?? meetData.invited_users ?? [];

  return {
    name: meetData.name,
    description: meetData.description || "",
    link: meetData.link || "",
    timeRanges,
    duration: meetData.duration || "",
    isCreator: meetData.isCreator,
    isCreatorAuth: meetData.isCreatorAuth,
    permissions: meetData.permissions,
    isClosed: Boolean(meetData.isClosed),
    inviteOnlyVote: Boolean(meetData.inviteOnlyVote),
    invitedUsers: invitedRaw.map(item => ({
      id: item.id,
      name: invitedName(item) || item.id,
      hasAvatar: Boolean(item.has_avatar ?? item.hasAvatar),
    })),
  };
};
