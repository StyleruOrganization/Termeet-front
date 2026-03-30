import CheckIcon from "@assets/icons/approve.svg";
import CrossIcon from "@assets/icons/cross.svg";
import RefreshIcon from "@assets/icons/refresh.svg";
import { getToastClassName } from "./lib/getters/getClassName";
import { useToastStore } from "./lib/store/Toast.store";
import style from "./ToastContainer.module.css";

export const ToastContainer = () => {
  const toasts = useToastStore(state => state.toasts);
  const removeToast = useToastStore(state => state.removeToast);

  return (
    <div className={style.ToastContainer}>
      {toasts.map(toast => (
        <div
          className={
            style.Toast +
            " " +
            getToastClassName(toast.type) +
            (toast.isExiting ? " " + style.Toast__Exiting : " " + style.Toast__Opening)
          }
          key={toast.id}
        >
          {toast.type === "success" && <CheckIcon />}
          {toast.type === "error" && <></>}
          {toast.type === "wait" && <RefreshIcon className={style.Toast__IconWait} />}
          <p>{toast.message}</p>
          <button className={style.Toast__Close} onClick={() => removeToast(toast.id)}>
            <CrossIcon />
          </button>
        </div>
      ))}
    </div>
  );
};
