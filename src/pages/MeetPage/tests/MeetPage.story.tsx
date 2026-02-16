import { MeetProvider } from "@/entities/Meet";
import { useMeetingInfo } from "../lib/meeting/useGetMeetingInfo";
import { useInitialContextValue } from "../lib/meeting/useInitialContextValue";
import { MeetPage } from "../MeetPage";

export const MeetPageStory = () => {
  const meetingInfo = useMeetingInfo({
    withSlots: true,
  });

  const { formattedUserSlots, maxSelectCount, users } = useInitialContextValue(meetingInfo.userSlots);
  return (
    <MeetProvider oldSelectedSlots={formattedUserSlots} maxSelectCount={maxSelectCount} users={users}>
      <div style={{ padding: "10px" }}>
        <MeetPage />
      </div>
    </MeetProvider>
  );
};
