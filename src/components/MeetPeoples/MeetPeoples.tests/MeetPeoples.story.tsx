import { MeetProvider } from "@shared/providers/MeetProvider";
import { MeetPeoples } from "../MeetPeoples";
import { mockUsers } from "./MeetPeoples.const";

export const MeetPeoplesStory = ({ hoveredUsers }: { hoveredUsers?: string[] }) => {
  return (
    <MeetProvider hoveredUsers={hoveredUsers} users={mockUsers}>
      <MeetPeoples />
    </MeetProvider>
  );
};
