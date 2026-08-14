import type { IUser } from "../model/User.types";

export const getProfileDisplayName = (user: IUser) => {
  return `${user.first_name} ${user.last_name}`.trim();
};
