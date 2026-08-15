import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

const BREAKPOINT_MOBILE = 768;
const MIN_WIDTH_COLUMN = 92;
const MIN_WIDTH_COLUMN_MOBILE = 72;
const WEEKDAY_COUNT = WEEKDAY_SHORT.length;
const HOUR_LABELS = TEMPLATE_TIMES.filter(time => time.endsWith(":00"));

const computeColumnWidth = (containerWidth: number) => {
  if (containerWidth <= 0) {
    return MIN_WIDTH_COLUMN;
  }
  const minWidth = containerWidth <= BREAKPOINT_MOBILE ? MIN_WIDTH_COLUMN_MOBILE : MIN_WIDTH_COLUMN;
  if (containerWidth / WEEKDAY_COUNT < minWidth) {
    const countVisible = Math.max(1, Math.min(WEEKDAY_COUNT, Math.floor(containerWidth / minWidth)));
    return (containerWidth - minWidth / 2) / countVisible;
  }
  return containerWidth / WEEKDAY_COUNT;
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
  const [columnWidth, setColumnWidth] = useState(MIN_WIDTH_COLUMN);
  const columnsRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ remove: boolean } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setWeek(intervalsToWeekMap(intervals));
      dragRef.current = null;
    }
  }, [isOpen, intervals]);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    const el = columnsRef.current;
    if (!el) {
      return;
    }
    const updateWidth = () => {
      const width = el.clientWidth;
      if (width > 0) {
        setColumnWidth(computeColumnWidth(width));
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

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
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const selected = week.get(cell.weekday)?.includes(cell.time) ?? false;
    dragRef.current = { remove: selected };
    toggleCell(cell.weekday, cell.time, selected);
  };

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = event => {
    if (!dragRef.current) {
      return;
    }
    event.preventDefault();
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
            {HOUR_LABELS.map(time => (
              <span key={time} className={styles.TemplateWeekModal__TimeLabel}>
                {time}
              </span>
            ))}
          </div>
          <div className={styles.TemplateWeekModal__ColumnsWrap}>
            <div
              ref={columnsRef}
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
                  <div
                    key={weekday}
                    className={styles.TemplateWeekModal__Day}
                    style={{ width: `${columnWidth}px`, minWidth: `${columnWidth}px` }}
                  >
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
