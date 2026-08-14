import { useCallback, useEffect, useState } from "react";
import { useSessionStore } from "../model/store/useSessionStore";

export const ONBOARDING_STORAGE_KEY = "termeet.showOnboarding";

const readLocal = () => {
  try {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) !== "false";
  } catch {
    return true;
  }
};

const writeLocal = (enabled: boolean) => {
  try {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, enabled ? "true" : "false");
  } catch {
    // private mode
  }
};

export const useShowOnboarding = () => {
  const user = useSessionStore(state => state.user);
  const updateSettings = useSessionStore(state => state.updateSettings);
  const [localEnabled, setLocalEnabled] = useState(readLocal);

  useEffect(() => {
    if (user && typeof user.show_onboarding === "boolean") {
      setLocalEnabled(user.show_onboarding);
      writeLocal(user.show_onboarding);
    }
  }, [user]);

  const enabled = user ? user.show_onboarding !== false && localEnabled : localEnabled;

  const setEnabled = useCallback(
    async (next: boolean) => {
      setLocalEnabled(next);
      writeLocal(next);
      if (user) {
        await updateSettings({ show_onboarding: next });
      }
    },
    [updateSettings, user],
  );

  const hide = useCallback(() => {
    void setEnabled(false);
  }, [setEnabled]);

  return { enabled, setEnabled, hide };
};
