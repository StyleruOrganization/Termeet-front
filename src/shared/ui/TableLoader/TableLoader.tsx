import React from "react";
import { LogoIcon } from "@assets/icons/logo";
import styles from "./TableLoader.module.css";

export const TableLoader = () => {
  const cells = Array.from({ length: 35 });

  return (
    <div className={styles.card}>
      <div className={`${styles.pill} ${styles.pillLeft}`} />

      <div className={styles.logo}>
        <LogoIcon />
      </div>

      <div className={styles.headerRight}>
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
  );
};
