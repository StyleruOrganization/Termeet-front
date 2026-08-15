import { useParams, useSearchParams } from "react-router";
import { MeetProvider, getMeetPermissions } from "@/entities/Meet";
import { useNow } from "@/shared/libs";
import { Container } from "@/shared/ui";
import { useGetMeetInfo } from "./api/useGetMeetInfo";
import styles from "./Meet.module.css";
import { ClosedMeet } from "./ui/ClosedMeet/ClosedMeet";
import { MeetHeader } from "./ui/MeetHeader/MeetHeader";
import { MeetInfo } from "./ui/MeetInfo/MeetInfo";
import { MeetPrefillModal } from "./ui/MeetPrefillModal/MeetPrefillModal";
import { MeetTable } from "./ui/MeetTable/MeetTable";
import { Onboarding } from "./ui/Onboarding/Onboarding";

const WINDOW_WIDTH = window.innerWidth;

export function Meet() {
  const [searchParams] = useSearchParams();
  const { hash = "" } = useParams();
  const isLocalTime = searchParams.get("localTime") === "true" || searchParams.get("localTime") == null;
  const { meetData } = useGetMeetInfo(hash, isLocalTime);
  const now = useNow();

  console.log("[Meet] render", {
    hash,
    isLocalTime,
    WINDOW_WIDTH,
    meetData,
    timeRanges: meetData?.timeRanges,
    meeting_days: meetData?.meeting_days,
    finalSlot: meetData?.finalSlot,
  });

  if (!hash || !meetData) {
    return <h1>Необходим идентификатор встречи</h1>;
  }

  if (meetData.accessDenied) {
    return <ClosedMeet data={meetData} />;
  }

  const permissions = getMeetPermissions(meetData);
  const deadlineLocked = Boolean(
    meetData.lockVoteAfterDeadline &&
    meetData.voteDeadline &&
    now > 0 &&
    new Date(meetData.voteDeadline).getTime() <= now,
  );
  const canVote = permissions.canVote && !deadlineLocked;
  console.log("[Meet] permissions", permissions);

  return (
    <Container>
      <MeetProvider
        timeInfo={meetData.timeInfo}
        timeRanges={meetData.timeRanges}
        users={meetData.users}
        finalSlot={meetData.finalSlot}
        duration={meetData.duration}
      >
        <div className={styles.MeetPage}>
          {WINDOW_WIDTH < 768 ? (
            <div className={styles.MeetPage__HeaderWrapper_Mobile}>
              <MeetHeader
                duration={meetData.duration}
                description={meetData.description}
                name={meetData.name}
                link={meetData.link}
                canManage={permissions.canEditMeet}
              />
            </div>
          ) : null}
          <div className={styles.MeetPage__InfoWrapper}>
            <MeetInfo hash={hash} data={meetData} />
          </div>
          <MeetTable
            key={isLocalTime ? "local" : "moscow"}
            meeting_days={meetData.meeting_days}
            timeRanges={meetData.timeRanges}
            mySlotName={meetData.mySlotName}
            canVote={canVote}
            canObserve={permissions.canObserve}
            canSetFinal={permissions.canSetFinal}
            hasFinal={meetData.finalSlot.size > 0}
          />
          <MeetPrefillModal
            hash={hash}
            canVote={canVote}
            mySlotName={meetData.mySlotName}
            timeInfo={meetData.timeInfo}
          />
          {WINDOW_WIDTH < 768 ? <Onboarding /> : null}
        </div>
      </MeetProvider>
    </Container>
  );
}
