export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info" | "wait";
  isExiting?: boolean;
  duration?: number;
}

export interface IToastStore {
  addToast: (toast: Toast) => void;
  removeToast: (id: string) => void;
  updateAnimateState: (id: string) => void;
  toasts: Toast[];
}
