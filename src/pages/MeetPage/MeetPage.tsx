import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { MeetProvider, MeetQueries } from "@/entities/Meet";
import styles from "./MeetPage.module.css";
import { MeetHeader } from "./ui/MeetHeader";
import { MeetModal } from "./ui/MeetModal";
import { MeetPeoples } from "./ui/MeetPeoples";
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
    <MeetProvider>
      <div data-test-id='meet-page' className={styles.MeetPage}>
        <MeetHeader duration={data.duration} description={data.description} name={data.name} />
        <MeetTable meeting_days={data.meeting_days} timeRanges={data.timeRanges} />
        <MeetPeoples />
        <MeetModal />
      </div>
    </MeetProvider>
  );
}
