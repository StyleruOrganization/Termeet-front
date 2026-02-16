import { MeetProvider } from "@/entities/Meet";
import { MeetModal } from "../MeetModal";

export const MeetModalStory = () => {
  return (
    <MeetProvider isModalOpen={true}>
      <MeetModal />
    </MeetProvider>
  );
};
