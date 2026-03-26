import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { MeetQueries } from "@/entities/Meet";
import styles from "./MeetPage.module.css";
import { MeetInfo } from "./ui/MeetInfo/MeetInfo";
import { MeetTable } from "./ui/MeetTable/MeetTable";

export function MeetPage() {
  const { hash } = useParams();
  const { data, isLoading } = useSuspenseQuery(MeetQueries.meet(hash || ""));

  if (!hash) {
    return <h1>Необходим идентификатор встречи</h1>;
  }
  if (isLoading) {
    return <h1>Загрузка...</h1>;
  }

  return (
    <div className={styles.MeetPage}>
      <div className={styles.MeetPage__MeetInfoWrapper}>
        <MeetInfo data={data} />
      </div>
      <MeetTable meeting_days={data.meeting_days} timeRanges={data.timeRanges} />
    </div>
  );
}
