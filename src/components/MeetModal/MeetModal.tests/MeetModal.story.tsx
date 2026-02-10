import { MeetProvider } from "@shared/providers/MeetProvider";
import { MeetModal } from "../MeetModal";

export const MeetModalStory = () => {
  return (
    <MeetProvider isModalOpen={true}>
      <MeetModal />
    </MeetProvider>
  );
};
