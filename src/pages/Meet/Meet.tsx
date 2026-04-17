import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
import { MeetProvider } from "@/entities/Meet";
import { Toggle } from "@/shared/ui";
import { useGetMeetInfo } from "./api/useGetMeetInfo";
import { getTimeZone } from "./lib";
import styles from "./Meet.module.css";
import { MeetHeader } from "./ui/MeetHeader/MeetHeader";
import { MeetInfo } from "./ui/MeetInfo/MeetInfo";
import { MeetTable } from "./ui/MeetTable/MeetTable";

const WINDOW_WIDTH = window.innerWidth;

export function Meet() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hash = "" } = useParams();
  const isLocalTime = searchParams.get("localTime") === "true" || searchParams.get("localTime") == null;
  const { meetData } = useGetMeetInfo(hash, isLocalTime);

  const timeZones = useMemo(() => {
    return getTimeZone();
  }, []);

  if (!hash || !meetData) {
    return <h1>Необходим идентификатор встречи</h1>;
  }

  const handleToggleChange = (dir: "left" | "right") => {
    if (timeZones.local.timeZoneOffset == timeZones.moscow.timeZoneOffset) return;
    const newValue = dir === "left";

    setSearchParams({ localTime: newValue.toString() }, { replace: true });
  };

  return (
    <MeetProvider timeInfo={meetData.timeInfo} timeRanges={meetData.timeRanges} users={meetData.users}>
      <div className={styles.MeetPage}>
        {WINDOW_WIDTH < 768 ? (
          <div className={styles.MeetPage__HeaderWrapper_Mobile}>
            <MeetHeader
              duration={meetData.duration}
              description={meetData.description}
              name={meetData.name}
              link={meetData.link}
            />
          </div>
        ) : null}
        <div className={styles.MeetPage__InfoWrapper}>
          <MeetInfo data={meetData} />
        </div>
        <div className={styles.MeetPage__TableWrapper}>
          <MeetTable
            key={isLocalTime ? "local" : "moscow"}
            meeting_days={meetData.meeting_days}
            timeRanges={meetData.timeRanges}
          />
          <Toggle
            LeftLabel={"По местному " + timeZones.local.utcString}
            RightLabel={"По Москве " + timeZones.moscow.utcString}
            defaultActive={isLocalTime ? "left" : "right"}
            onChange={handleToggleChange}
          />
        </div>
      </div>
    </MeetProvider>
  );
}
