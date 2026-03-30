import { useEffect, useMemo } from "react";
import { useLocation, useParams, useSearchParams } from "react-router";
import { MeetProvider } from "@/entities/Meet";
import { useToastStore } from "@/features/ToastContainer";
import { Toggle } from "@/shared/ui";
import { useGetMeetInfo } from "./api/useGetMeetInfo";
import { getTimeZone } from "./lib/timezones/getTimezone";
import styles from "./MeetPage.module.css";
import { MeetInfo } from "./ui/MeetInfo/MeetInfo";
import { MeetTable } from "./ui/MeetTable/MeetTable";

export function MeetPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hash = "" } = useParams();
  const location = useLocation();
  const isLocalTime = searchParams.get("localTime") === "true" || searchParams.get("localTime") == null;
  const { meetData } = useGetMeetInfo(hash, isLocalTime);
  const addToast = useToastStore(state => state.addToast);

  const timeZones = useMemo(() => {
    return getTimeZone();
  }, []);

  useEffect(() => {
    if (location.state?.showToast) {
      addToast({
        type: "success",
        message: "Информация о встрече успешно обновлена",
        id: "update-meet-success",
      });

      window.history.replaceState({}, document.title);
    }
  }, [location.state, addToast]);

  if (!hash || !meetData) {
    return <h1>Необходим идентификатор встречи</h1>;
  }

  const handleToggleChange = (dir: "left" | "right") => {
    // if (timeZones.local.timeZoneOffset == timeZones.moscow.timeZoneOffset) return;
    const newValue = dir === "left";

    setSearchParams({ localTime: newValue.toString() }, { replace: true });
  };

  return (
    <MeetProvider timeInfo={meetData.timeInfo} timeRanges={meetData.timeRanges} users={meetData.users}>
      <div className={styles.MeetPage}>
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
            leftLabel={"По местному " + timeZones.local.utcString}
            rightLabel={"По Москве " + timeZones.moscow.utcString}
            defaultActive={isLocalTime ? "left" : "right"}
            onChange={handleToggleChange}
          />
        </div>
      </div>
    </MeetProvider>
  );
}
