export interface MeetPermissions {
  canEditMeet: boolean;
  canDeleteParticipants: boolean;
  canEditSettings: boolean;
  canVote: boolean;
  canObserve: boolean;
  canSetFinal: boolean;
  isObserver: boolean;
}

export interface ObserverUser {
  name: string;
  userId?: string | null;
}

export interface SlotsUser {
  name: string;
  userId?: string | null;
  user_id?: string | null;
  slots: [string, string][];
  isAuth?: boolean;
}

export interface MeetResponse {
  name: string;
  description?: string | null;
  link?: string | null;
  duration?: string | null;
  data_range?: [string, string][] | null;
  dataRange?: [string, string][] | null;
  hash: string;
  slots?: SlotsUser[];
  isCreatorAuth: boolean;
  isCreator: boolean;
  anyoneCanEdit?: boolean;
  anyoneCanDeleteParticipants?: boolean;
  requireLoginToVote?: boolean;
  anyoneCanSetFinal?: boolean;
  finalSlot?: [string, string][] | null;
  final_slot?: [string, string][] | null;
  organizerName?: string | null;
  observers?: ObserverUser[];
  permissions?: MeetPermissions;
  calendarSync?: {
    synced?: number;
    conflicts?: { name: string; titles?: string[] }[];
  } | null;
  isClosed?: boolean;
  inviteOnlyVote?: boolean;
  teamId?: number | null;
  teamName?: string | null;
  team_id?: number | null;
  team_name?: string | null;
  accessDenied?: boolean;
  access_denied?: boolean;
  organizerContacts?: {
    email?: string | null;
    telegram?: string | null;
    vk?: string | null;
  } | null;
  voteDeadline?: string | null;
  vote_deadline?: string | null;
  remindEnabled?: boolean;
  remind_enabled?: boolean;
  remindOffsets?: number[];
  remind_offsets?: number[];
  lockVoteAfterDeadline?: boolean;
  lock_vote_after_deadline?: boolean;
  invitedUserIds?: string[];
  invited_user_ids?: string[];
  invitedUsers?: InvitedUser[];
  invited_users?: InvitedUser[];
}

export interface InvitedUser {
  id: string;
  first_name: string;
  last_name: string;
  has_avatar?: boolean;
  hasAvatar?: boolean;
}

export const getMeetDateRange = (meet: MeetResponse): [string, string][] => {
  const ranges = meet.dataRange ?? meet.data_range;
  if (!Array.isArray(ranges)) {
    return [];
  }
  return ranges.filter((range): range is [string, string] => Array.isArray(range) && range.length >= 2);
};

export interface MeetCreate {
  name: string;
  description?: string | null;
  link?: string | null;
  duration?: string | null;
  dataRange: string[][];
  invitedUserIds?: string[];
  teamId?: number | null;
  isClosed?: boolean;
  inviteOnlyVote?: boolean;
  createTelemost?: boolean;
  voteDeadline?: string | null;
  anyoneCanEdit?: boolean;
  anyoneCanDeleteParticipants?: boolean;
  requireLoginToVote?: boolean;
  anyoneCanSetFinal?: boolean;
  remindEnabled?: boolean;
  remindOffsets?: number[];
  lockVoteAfterDeadline?: boolean;
}

export interface MeetSettingsUpdate {
  anyoneCanEdit: boolean;
  anyoneCanDeleteParticipants: boolean;
  requireLoginToVote: boolean;
  anyoneCanSetFinal?: boolean;
  isClosed?: boolean;
  inviteOnlyVote?: boolean;
  voteDeadline?: string | null;
  remindEnabled?: boolean;
  remindOffsets?: number[];
  lockVoteAfterDeadline?: boolean;
}

export interface ApiError {
  message: string;
}
