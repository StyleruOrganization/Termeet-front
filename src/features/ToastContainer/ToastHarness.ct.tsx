import { useEffect } from "react";
import { useToastStore } from "./lib/store/Toast.store";
import { ToastContainer } from "./ToastContainer";
import type { Toast } from "./model/Toast.types";

export function ToastHarness({ toasts }: { toasts: Toast[] }) {
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    useToastStore.setState({ toasts: [] });
    toasts.forEach(t => addToast(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16, minHeight: 200, background: "var(--fill-bg)" }}>
      <ToastContainer />
    </div>
  );
}
