import { create } from "zustand";
import type { IToastStore } from "../../model/Toast.types";

const hideTimers = new Map<string, ReturnType<typeof setTimeout>>();

const clearHideTimer = (id: string) => {
  const timer = hideTimers.get(id);
  if (timer) {
    clearTimeout(timer);
    hideTimers.delete(id);
  }
};

export const useToastStore = create<IToastStore>((set, get) => ({
  toasts: [],
  addToast: toastInfo => {
    console.log("TOAST INFO", toastInfo);
    console.log("TOASTS", get().toasts);
    clearHideTimer(toastInfo.id);
    set(state => ({
      toasts: [...state.toasts.filter(toast => toast.id !== toastInfo.id), { ...toastInfo, isExiting: false }],
    }));
    if (toastInfo.type !== "wait") {
      hideTimers.set(
        toastInfo.id,
        setTimeout(() => {
          hideTimers.delete(toastInfo.id);
          const currentToast = get().toasts.find(toast => toast.id === toastInfo.id);
          if (currentToast && !currentToast.isExiting) {
            get().removeToast(currentToast.id);
          }
        }, toastInfo.duration || 3000),
      );
    }
  },
  removeToast: id => {
    clearHideTimer(id);
    if (!get().toasts.some(toast => toast.id === id)) {
      return;
    }
    get().updateAnimateState(id);
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
    }, 300);
  },
  hasIdToast: id => get().toasts.some(toast => toast.id === id),
  updateAnimateState: id =>
    set(state => ({
      toasts: state.toasts.map(toast => (toast.id === id ? { ...toast, isExiting: true } : toast)),
    })),
}));
