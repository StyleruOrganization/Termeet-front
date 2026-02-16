import { MeetProvider } from "@/entities/Meet";
import { MeetHeader } from "../MeetHeader";

export const MeetHeaderStory = () => {
  return (
    <MeetProvider>
      <div style={{ padding: "10px" }}>
        <MeetHeader
          name='Встреча команды'
          description='Еженедельная встреча команды для обсуждения текущих задач'
          duration='01:30'
        />
      </div>
    </MeetProvider>
  );
};
