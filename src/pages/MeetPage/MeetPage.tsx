import { MeetHeader } from "@/components/MeetHeader";
import { MeetModal } from "@/components/MeetModal";
import { MeetPeoples } from "@/components/MeetPeoples";
import { MeetTable } from "@/components/MeetTable";
import { useMeetingInfo } from "./MeetPage.hooks/useGetMeetingInfo";
import { useInitialContextValue } from "./MeetPage.hooks/useInitialContextValue";
import styles from "./MeetPage.module.css";
import { IMeetProvider } from "./MeetPage.providers/MeetProvider";

export default function MeetPage() {
  const meetingInfo = useMeetingInfo({
    withSlots: true,
  });

  const { formattedUserSlots, maxSelectCount, users } = useInitialContextValue(meetingInfo.userSlots);

  return (
    <IMeetProvider oldSelectedSlots={formattedUserSlots} maxSelectCount={maxSelectCount} users={users}>
      <div className={styles.MeetPage}>
        <MeetHeader
          duration={meetingInfo.meeting.duration}
          description={meetingInfo.meeting.description}
          name={meetingInfo.meeting.name}
        />
        <MeetTable
          meeting_days={meetingInfo.meeting.meeting_days}
          start_time={meetingInfo.meeting.start_time}
          end_time={meetingInfo.meeting.end_time}
        />
        <MeetPeoples />
        <MeetModal />
      </div>
    </IMeetProvider>
  );
}
