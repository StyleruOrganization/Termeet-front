import { useParams, useSearchParams } from "react-router";
import { MeetProvider, canManageMeeting } from "@/entities/Meet";
import { Container } from "@/shared/ui";
import { useGetMeetInfo } from "./api/useGetMeetInfo";
import styles from "./Meet.module.css";
import { MeetHeader } from "./ui/MeetHeader/MeetHeader";
import { MeetInfo } from "./ui/MeetInfo/MeetInfo";
import { MeetTable } from "./ui/MeetTable/MeetTable";
import { Onboarding } from "./ui/Onboarding/Onboarding";

const WINDOW_WIDTH = window.innerWidth;

export function Meet() {
  const [searchParams] = useSearchParams();
  const { hash = "" } = useParams();
  const isLocalTime = searchParams.get("localTime") === "true" || searchParams.get("localTime") == null;
  const { meetData } = useGetMeetInfo(hash, isLocalTime);

  if (!hash || !meetData) {
    return <h1>Необходим идентификатор встречи</h1>;
  }

  const canManage = canManageMeeting(meetData.isCreator, meetData.isCreatorAuth);

  return (
    <Container>
      <MeetProvider timeInfo={meetData.timeInfo} timeRanges={meetData.timeRanges} users={meetData.users}>
        <div className={styles.MeetPage}>
          {WINDOW_WIDTH < 768 ? (
            <div className={styles.MeetPage__HeaderWrapper_Mobile}>
              <MeetHeader
                duration={meetData.duration}
                description={meetData.description}
                name={meetData.name}
                link={meetData.link}
                canManage={canManage}
              />
            </div>
          ) : null}
          <div className={styles.MeetPage__InfoWrapper}>
            <MeetInfo data={meetData} />
          </div>
          <MeetTable
            key={isLocalTime ? "local" : "moscow"}
            meeting_days={meetData.meeting_days}
            timeRanges={meetData.timeRanges}
            mySlotName={meetData.mySlotName}
          />
          {WINDOW_WIDTH < 768 ? <Onboarding /> : null}
        </div>
      </MeetProvider>
    </Container>
  );
}
