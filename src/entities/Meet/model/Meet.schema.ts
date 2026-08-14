export interface MeetPermissions {
  canEditMeet: boolean;
  canDeleteParticipants: boolean;
  canEditSettings: boolean;
  canVote: boolean;
  canObserve: boolean;
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
  data_range: [string, string][];
  hash: string;
  slots: SlotsUser[];
  isCreatorAuth: boolean;
  isCreator: boolean;
  anyoneCanEdit?: boolean;
  anyoneCanDeleteParticipants?: boolean;
  requireLoginToVote?: boolean;
  organizerName?: string | null;
  observers?: ObserverUser[];
  permissions?: MeetPermissions;
}

export interface MeetCreate {
  name: string;
  description?: string | null;
  link?: string | null;
  duration?: string | null;
  dataRange: string[][];
}

export interface MeetSettingsUpdate {
  anyoneCanEdit: boolean;
  anyoneCanDeleteParticipants: boolean;
  requireLoginToVote: boolean;
}

export interface ApiError {
  message: string;
}
