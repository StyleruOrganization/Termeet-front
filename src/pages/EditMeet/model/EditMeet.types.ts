import type { IMeet } from "@entities/Meet";

export type IEditMeetPayload = Pick<IMeet, "description" | "name" | "link" | "duration"> & {
  invitedUserIds?: string[];
};

export interface State extends Pick<IMeet, "description" | "name" | "link" | "duration"> {
  errors: Partial<Pick<IMeet, "description" | "name" | "link">>;
}

export type Action = {
  type: "validate" | "change" | "clearError";
  payload: {
    value?: string;
    fieldName?: keyof Omit<State, "errors">;
  };
};
