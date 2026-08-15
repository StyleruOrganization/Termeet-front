export const userAvatarUrl = (id: string, bust?: string | number) =>
  `/api/users/${id}/avatar${bust != null ? `?v=${bust}` : ""}`;

export const teamPhotoUrl = (id: number, bust?: string | number) =>
  `/api/teams/${id}/photo${bust != null ? `?v=${bust}` : ""}`;
