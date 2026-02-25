// shared/ui/Loader/PulseLoader.tsx
import styles from "./Loader.module.css";

export const Loader = () => (
  <div className={styles.PulseLoader}>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
    <div className={styles.dot}></div>
  </div>
);
