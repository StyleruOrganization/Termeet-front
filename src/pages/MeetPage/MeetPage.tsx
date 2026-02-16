import { MeetProvider } from "@/entities/Meet";
import { useMeetingInfo, useInitialContextValue } from "./lib";
import styles from "./MeetPage.module.css";
import { MeetHeader } from "./ui/MeetHeader";
import { MeetModal } from "./ui/MeetModal";
import { MeetPeoples } from "./ui/MeetPeoples";
import { MeetTable } from "./ui/MeetTable/MeetTable";

export function MeetPage() {
  const meetingInfo = useMeetingInfo({
    withSlots: true,
  });

  const { formattedUserSlots, maxSelectCount, users } = useInitialContextValue(meetingInfo.userSlots);

  return (
    <MeetProvider oldSelectedSlots={formattedUserSlots} maxSelectCount={maxSelectCount} users={users}>
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
    </MeetProvider>
  );
}
