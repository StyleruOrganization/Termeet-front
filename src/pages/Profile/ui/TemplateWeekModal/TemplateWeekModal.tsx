import { useEffect, useRef, useState } from "react";
import {
  TEMPLATE_TIMES,
  WEEKDAY_SHORT,
  intervalsToWeekMap,
  weekMapToIntervals,
  type IAvailabilityInterval,
} from "@/entities/User";
import { ModalWrapper } from "@/shared/ui";
import styles from "./TemplateWeekModal.module.css";

type TemplateWeekModalProps = {
  isOpen: boolean;
  intervals: IAvailabilityInterval[];
  onClose: () => void;
  onSave: (next: IAvailabilityInterval[]) => void;
};

const parseCell = (value: string | null) => {
  if (!value) {
    return null;
  }
  const [weekday, time] = value.split("T");
  const day = Number(weekday);
  if (!day || !time) {
    return null;
  }
  return { weekday: day, time };
};

export const TemplateWeekModal = ({ isOpen, intervals, onClose, onSave }: TemplateWeekModalProps) => {
  const [week, setWeek] = useState(() => intervalsToWeekMap(intervals));
  const dragRef = useRef<{ remove: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setWeek(intervalsToWeekMap(intervals));
      dragRef.current = null;
    }
  }, [isOpen, intervals]);

  const toggleCell = (weekday: number, time: string, remove: boolean) => {
    setWeek(current => {
      const next = new Map(current);
      const times = new Set(next.get(weekday) ?? []);
      if (remove) {
        times.delete(time);
      } else {
        times.add(time);
      }
      next.set(weekday, [...times]);
      return next;
    });
  };

  const handlePointerDown: React.PointerEventHandler<HTMLDivElement> = event => {
    const cell = parseCell(
      (event.target as HTMLElement).closest("[data-week-cell]")?.getAttribute("data-week-cell") ?? null,
    );
    if (!cell) {
      return;
    }
    if (event.pointerType === "mouse") {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    const selected = week.get(cell.weekday)?.includes(cell.time) ?? false;
    dragRef.current = event.pointerType === "mouse" ? { remove: selected } : null;
    toggleCell(cell.weekday, cell.time, selected);
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = event => {
    if (!dragRef.current || event.pointerType !== "mouse") {
      return;
    }
    const cell = parseCell(
      document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest("[data-week-cell]")
        ?.getAttribute("data-week-cell") ?? null,
    );
    if (!cell) {
      return;
    }
    const selected = week.get(cell.weekday)?.includes(cell.time) ?? false;
    if (dragRef.current.remove && selected) {
      toggleCell(cell.weekday, cell.time, true);
    }
    if (!dragRef.current.remove && !selected) {
      toggleCell(cell.weekday, cell.time, false);
    }
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} isAnimate>
      <div className={styles.TemplateWeekModal}>
        <h2>Обычное время по дням недели</h2>
        <p>
          Зажмите и проведите по ячейкам — как на встрече. Понедельник отдельно от субботы. На встрече подставятся часы
          того дня недели, который выпал в сетке.
        </p>
        <div className={styles.TemplateWeekModal__Table}>
          <div className={styles.TemplateWeekModal__Times}>
            {TEMPLATE_TIMES.map(time => (
              <span key={time} className={styles.TemplateWeekModal__TimeLabel}>
                {time.endsWith(":00") ? time : ""}
              </span>
            ))}
          </div>
          <div
            className={styles.TemplateWeekModal__Columns}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {WEEKDAY_SHORT.map((label, index) => {
              const weekday = index + 1;
              const selected = new Set(week.get(weekday) ?? []);
              return (
                <div key={weekday} className={styles.TemplateWeekModal__Day}>
                  <span className={styles.TemplateWeekModal__DayTitle}>{label}</span>
                  {TEMPLATE_TIMES.map((time, timeIndex) => (
                    <div
                      key={time}
                      data-week-cell={`${weekday}T${time}`}
                      data-first-cell={timeIndex === 0}
                      data-last-cell={timeIndex === TEMPLATE_TIMES.length - 1}
                      className={`${styles.TemplateWeekModal__Cell} ${selected.has(time) ? styles.TemplateWeekModal__Cell_selected : ""}`}
                      aria-label={`${label} ${time}`}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.TemplateWeekModal__Buttons}>
          <button
            type='button'
            className='baseButton mainButton'
            onClick={() => {
              onSave(weekMapToIntervals(week));
              onClose();
            }}
          >
            Сохранить неделю
          </button>
          <button type='button' className='baseButton secondaryButton' onClick={onClose}>
            Отменить
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};
