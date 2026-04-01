import LogoIcon from "@assets/icons/logo.svg";
import styles from "./Loader.module.css";

export const Loader = ({ message = "Загружаем слоты ..." }) => {
  return (
    <div className={styles.loader__wrapper}>
      <LogoIcon className={styles.loader__logo} />
      <div className={styles.loader__message}>{message}</div>
    </div>
  );
};
