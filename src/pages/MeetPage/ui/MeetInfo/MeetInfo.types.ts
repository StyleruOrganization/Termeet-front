import type { IMeet } from "@/entities/Meet";

export interface IMeetInfoProps {
  data: Pick<IMeet, "description" | "duration" | "link" | "name" | "users">;
}
