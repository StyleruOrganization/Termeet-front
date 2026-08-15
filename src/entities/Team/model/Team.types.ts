export interface ITeamMember {
  id: string;
  first_name: string;
  last_name: string;
  has_avatar?: boolean;
}

export interface ITeam {
  id: number;
  name: string;
  slug: string;
  description: string;
  hasPhoto?: boolean;
  isOwner?: boolean;
  members: ITeamMember[];
}

export interface ITeamPayload {
  name: string;
  slug: string;
  description: string;
  memberIds: string[];
}
