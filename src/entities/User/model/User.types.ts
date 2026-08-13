export interface IUser {
  id: string;
  first_name: string;
  last_name: string;
  nickname?: string | null;
  is_active: boolean;
  is_verified: boolean;
  email: string;
  additional_emails?: string[] | null;
}

export interface ITokenInfo {
  access_token: string;
  token_type: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IRegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  do_verify_email: boolean;
}

export type SessionStatus = "idle" | "loading" | "authenticated" | "anonymous";
