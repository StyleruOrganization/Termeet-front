import ToolTipArrowIcon from "@assets/icons/tooltip-arrow.svg";
import { useColorPalette } from "@shared/libs/hooks/useColorPalette";
import styles from "./Calendar.module.css";

interface CalendarProps {
  times: number[][];
  dates: string[];
  cells: number[];
  /** Задержка перед появлением тултипа (мс) */
  tooltipDelay?: number;
  /** Триггер: показывать тултип только когда секция попала в viewport */
  inView?: boolean;
}

const Cell = ({
  className,
  cell,
  tooltipDelay,
  inView,
}: {
  className: string;
  cell: number;
  tooltipDelay?: number;
  inView?: boolean;
}) => {
  const { color } = useColorPalette({
    countSelectPerson: cell,
    totalPersons: 10,
  });

  const isHighlighted = cell === 10;

  return (
    <span
      className={className}
      style={
        {
          "--bg-color": color || "var(--fill-bg)",
          "--border-color": color || "var(--semantics-gray-default)",
          "position": isHighlighted ? "relative" : "static",
        } as React.CSSProperties
      }
    >
      {isHighlighted && (
        <div
          className={`${styles.cellTooltip} ${inView ? styles.cellTooltip_visible : ""}`}
          style={{ "--tooltip-delay": `${tooltipDelay ?? 0}ms` } as React.CSSProperties}
        >
          <div className={styles.cellTooltipContent}>
            <span className={styles.cellTooltipTime}>Рекомендуем</span>
            <span className={styles.cellTooltipCount}>13:30 - 14:00</span>
          </div>
          <ToolTipArrowIcon />
        </div>
      )}
    </span>
  );
};

export const Calendar = ({ times, dates, cells, tooltipDelay, inView }: CalendarProps) => {
  return (
    <div className={styles.Calendar}>
      <div className={styles.Calendar__TimeWrapper}>
        {times.map(time => (
          <span key={time[0]} className={styles.Calendar__Time}>
            {`${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")}`}
          </span>
        ))}
      </div>
      <div className={styles.CalendarWrapper}>
        {dates.map(date => (
          <span key={date} className={styles.Calendar__Date}>
            {date}
          </span>
        ))}
        {cells.map((cell, index) => {
          let className = "";
          if (index === 0) {
            className += styles.Calendar__Cell_first;
          }
          if (index === cells.length - 1) {
            className += styles.Calendar__Cell_last;
          }
          if (index === 5) {
            className += styles.Calendar__Cell_six;
          }
          if (index === 102) {
            className += styles.Calendar__Cell_hundred;
          }

          return (
            <Cell
              key={index}
              className={`${styles.Calendar__Cell} ${className}`}
              cell={cell}
              tooltipDelay={tooltipDelay}
              inView={inView}
            />
          );
        })}
      </div>
    </div>
  );
};
