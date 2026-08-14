import type { IMeet } from "@/entities/Meet";

export interface MeetPeoplesProps {
  users: string[];
  userAuth: Record<string, boolean>;
  organizerName: string | null;
  mySlotName: string | null;
  observers: string[];
  isCreator: boolean;
  data: Pick<IMeet, "permissions" | "isCreator" | "isCreatorAuth">;
}
