import { create } from "zustand";
import { refreshAccessToken, setAccessToken, setOnUnauthorized } from "@/shared/api";
import { getMeRequest, logoutRequest } from "../../api/userApi";
import type { IUser, SessionStatus } from "../User.types";

interface ISessionStore {
  user: IUser | null;
  status: SessionStatus;
  setUser: (user: IUser | null) => void;
  applyAccessToken: (token: string) => Promise<IUser>;
  restore: () => Promise<void>;
  logout: () => Promise<void>;
  clear: () => void;
}

export const useSessionStore = create<ISessionStore>((set, get) => ({
  user: null,
  status: "idle",
  setUser: user => set({ user, status: user ? "authenticated" : "anonymous" }),
  applyAccessToken: async token => {
    setAccessToken(token);
    const user = await getMeRequest();
    set({ user, status: "authenticated" });
    return user;
  },
  restore: async () => {
    if (get().status === "loading") {
      return;
    }

    set({ status: "loading" });
    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      set({ user: null, status: "anonymous" });
      return;
    }

    try {
      const user = await getMeRequest();
      set({ user, status: "authenticated" });
    } catch {
      setAccessToken(null);
      set({ user: null, status: "anonymous" });
    }
  },
  logout: async () => {
    try {
      await logoutRequest();
    } catch {
      // cookie already gone
    }
    get().clear();
  },
  clear: () => {
    setAccessToken(null);
    set({ user: null, status: "anonymous" });
  },
}));

setOnUnauthorized(() => {
  useSessionStore.getState().clear();
});
