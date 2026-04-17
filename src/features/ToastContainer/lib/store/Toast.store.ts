import { create } from "zustand";
import type { IToastStore } from "../../model/Toast.types";

export const useToastStore = create<IToastStore>((set, get) => ({
  toasts: [],
  addToast: toastInfo => {
    console.log("TOAST INFO", toastInfo);
    console.log("TOASTS", get().toasts);
    if (!get().toasts.some(toast => toast.id === toastInfo.id)) {
      set(state => ({ toasts: [...state.toasts, toastInfo] }));
      // Автоудаление для не-wait тостов
      if (toastInfo.type !== "wait") {
        setTimeout(() => {
          const currentToast = get().toasts.find(t => t.id === toastInfo.id);
          // Удаляем только если тост еще существует и не в процессе анимации
          if (currentToast && !currentToast.isExiting) {
            get().removeToast(currentToast.id);
          }
        }, toastInfo.duration || 3000);
      }
    }
  },
  removeToast: id => {
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
