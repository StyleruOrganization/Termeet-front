import { create } from "zustand";
import type { IToastStore } from "../../model/Toast.types";

export const useToastStore = create<IToastStore>((set, get) => ({
  toasts: [],
  addToast: toast => {
    set(state => ({ toasts: [...state.toasts, toast] }));
    // Автоудаление для не-wait тостов
    if (toast.type !== "wait") {
      setTimeout(() => {
        const currentToast = get().toasts.find(t => t.id === toast.id);
        // Удаляем только если тост еще существует и не в процессе анимации
        if (currentToast && !currentToast.isExiting) {
          get().removeToast(currentToast.id);
        }
      }, toast.duration || 3000);
    }
  },
  removeToast: id => {
    get().updateAnimateState(id);
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(toast => toast.id !== id) }));
    }, 300);
  },
  updateAnimateState: id =>
    set(state => ({
      toasts: state.toasts.map(toast => (toast.id === id ? { ...toast, isExiting: true } : toast)),
    })),
}));
