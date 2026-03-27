import React from "react";
import LogoIcon from "@assets/icons/logo.svg";
import styles from "./Loader.module.css";

export const Loader = () => {
  const cells = Array.from({ length: 35 });

  return (
    <div className={styles.loader__wrapper}>
      <div className={styles.loader}>
        <div className={styles.header}>
          <div className={`${styles.pill} ${styles.pillLeft}`} />

          <div className={styles.logo}>
            <LogoIcon />
          </div>

          <div className={`${styles.pill} ${styles.pillSmall}`} />
          <div className={`${styles.pill} ${styles.pillSmall}`} />
        </div>
        <div className={styles.gridContainer}>
          {cells.map((_, index) => {
            const rowIndex = Math.floor(index / 7);
            const colIndex = index % 7;

            return (
              <div
                key={index}
                className={styles.cell}
                style={
                  {
                    "--row": rowIndex,
                    "--col": colIndex,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
      </div>
      <div className={styles.loader__message}>Загружаем слоты ...</div>
    </div>
  );
};
