import type { IMeet } from "../model/Meet.types";

const openMeetingPermissions = {
  canEditMeet: true,
  canDeleteParticipants: true,
  canEditSettings: false,
  canVote: true,
  canObserve: false,
  canSetFinal: false,
  isObserver: false,
};

export const getMeetPermissions = (meet: Pick<IMeet, "permissions" | "isCreator" | "isCreatorAuth">) => {
  if (meet.permissions) {
    return meet.permissions;
  }

  if (!meet.isCreatorAuth) {
    return openMeetingPermissions;
  }

  return {
    canEditMeet: meet.isCreator,
    canDeleteParticipants: meet.isCreator,
    canEditSettings: meet.isCreator,
    canVote: true,
    canObserve: false,
    canSetFinal: meet.isCreator,
    isObserver: false,
  };
};

export const canEditMeet = (meet: Pick<IMeet, "permissions" | "isCreator" | "isCreatorAuth">) => {
  return getMeetPermissions(meet).canEditMeet;
};

export const canManageMeeting = (isCreator: boolean, isCreatorAuth: boolean) => {
  return isCreator || !isCreatorAuth;
};
