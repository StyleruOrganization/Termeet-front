import style from "../../ToastContainer.module.css";
import type { Toast } from "../../model/Toast.types";

export const getToastClassName = (type: Toast["type"]) => {
  switch (type) {
    case "success":
      return style.Toast__Success;
    case "error":
      return style.Toast__Error;
    case "warning":
      return style.Toast__Warning;
    case "info":
      return style.Toast__Info;
    case "wait":
      return style.Toast__Wait;
    default:
      return "";
  }
};
