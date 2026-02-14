import { MeetProvider } from "@shared/providers/MeetProvider";
import { MeetPage } from "../MeetPage";
import { useMeetingInfo } from "../MeetPage.hooks/useGetMeetingInfo";
import { useInitialContextValue } from "../MeetPage.hooks/useInitialContextValue";

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
