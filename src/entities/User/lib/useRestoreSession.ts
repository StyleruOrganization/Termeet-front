import { useEffect } from "react";
import { useSessionStore } from "../model/store/useSessionStore";

export const useRestoreSession = () => {
  const restore = useSessionStore(state => state.restore);

  useEffect(() => {
    restore();
  }, [restore]);
};
