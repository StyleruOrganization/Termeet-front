import { useNavigate } from "react-router";
import BigIcon from "@assets/icons/bigShadow.svg";
import LogoIcon from "@assets/icons/logo.svg";
import SmallIcon from "@assets/icons/smallShadow.svg";
import styles from "./Entry.module.css";

export const Entry = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.EntryPage}>
      <div className={styles.EntryPage__Content}>
        <div className={styles.EntryPage__Content__Wrapper}>
          <div className={styles.EntryPage__Content__Logo}>
            <LogoIcon />
            <h1>termeet</h1>
          </div>
          <p className={styles.EntryPage__Content__Description}>
            Термит помогает небольшим командам быстро организовывать встречи без чатов в&nbsp;Телеграме
          </p>
          <button
            className={`baseButton mainButton ${styles.EntryPage__Content__Button}`}
            onClick={() => navigate("/create")}
          >
            Создать встречу
          </button>
        </div>
      </div>
      <div className={styles.EntryPage__Section}>
        <div className={styles.EntryPage__Section__Bg}>
          <SmallIcon className={styles.EntryPage__Section__Bg__SmallIcon} />
          <BigIcon className={styles.EntryPage__Section__Bg__BigIcon} />
        </div>
      </div>
    </div>
  );
};
