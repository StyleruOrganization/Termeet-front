import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import ToolTipArrowIcon from "@assets/icons/tooltip-arrow.svg";
import { useMeetStore } from "@entities/Meet";
import styles from "./TableCell.module.css";
import { useColorPalette } from "../../lib";
import type { TableCellProps } from "./TableCell.types";

const TOOLTIP_WIDTH = 118;
const ARROW_HEIGHT = 14; // высота стрелки
const OFFSET_Y = 4; // отступ от ячейки
const TOOLTIP_DISABLED_HEIGHT = 72 + ARROW_HEIGHT + OFFSET_Y;
const TOOLTIP_USUAL_HEIGHT = 40 + ARROW_HEIGHT + OFFSET_Y;

export const TableCell = ({
  id,
  users,
  isTimeZoneDisabled,
  isBeforeCurrentTime,
  isFirstCell,
  isLastCell,
  columnRef,
}: TableCellProps) => {
  const setHoveredUsers = useMeetStore(store => store.setHoveredUsers),
    isEditingMode = useMeetStore(store => store.isEditing),
    hoveredUser = useMeetStore(store => store.hoveredUser),
    newSelectedSlots = useMeetStore(store => store.newSelectedSlots.get(id.split("T")[0])),
    allUsers = useMeetStore(store => store.users);
  const cellRef = useRef<HTMLDivElement>(null);

  const countAllPeople = allUsers?.length;
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({
    top: 0,
    left: 0,
    arrowDirection: "",
  });

  const variableColors = useColorPalette({
    countSelectPerson: users?.length || 0,
  });

  const isDisabled = useMemo(() => {
    return isTimeZoneDisabled || (isBeforeCurrentTime && users?.length == 0) || (isBeforeCurrentTime && isEditingMode);
  }, [isTimeZoneDisabled, isBeforeCurrentTime, users, isEditingMode]);

  const timeInterval = useMemo(() => {
    if (isTimeZoneDisabled) return;
    const [hours, minutes] = id.split("T")[1].split(":").map(Number);
    const totalminutes = hours * 60 + minutes + 30;

    return `${hours}:${minutes.toString().padStart(2, "0")} - ${Math.floor(totalminutes / 60)
      .toString()
      .padStart(2, "0")}:${(totalminutes % 60).toString().padStart(2, "0")}`;
  }, [id, isTimeZoneDisabled]);

  // Функция для расчета позиции тултипа
  const calculateTooltipPosition = useCallback(() => {
    if (!cellRef.current || !columnRef?.current) return;

    const cellRect = cellRef.current.getBoundingClientRect();
    const columnRect = columnRef.current.getBoundingClientRect();
    const cellWidth = cellRect.width;
    const TOOLTIP_HEIGHT = isTimeZoneDisabled || isBeforeCurrentTime ? TOOLTIP_DISABLED_HEIGHT : TOOLTIP_USUAL_HEIGHT;
    const WINDOW_WIDTH = window.innerWidth;

    // Базовая позиция: над ячейкой
    const spaceAbowCell = cellRect.top - columnRect.top;

    if (columnRect.top > TOOLTIP_HEIGHT && spaceAbowCell > TOOLTIP_HEIGHT) {
      const poistions = {
        top: cellRect.y - TOOLTIP_HEIGHT,
        left:
          TOOLTIP_WIDTH > cellWidth
            ? cellRect.x + (cellWidth - TOOLTIP_WIDTH) / 2
            : cellRect.x - (TOOLTIP_WIDTH - cellWidth) / 2,
        arrowDirection: "up",
      };

      if (TOOLTIP_WIDTH > cellWidth && WINDOW_WIDTH - cellRect.right < TOOLTIP_WIDTH - cellWidth / 2) {
        poistions.left = cellRect.x - (TOOLTIP_WIDTH - cellWidth);
      }

      if (TOOLTIP_WIDTH > cellWidth && cellRect.left < TOOLTIP_WIDTH - cellWidth / 2) {
        poistions.left = cellRect.x;
      }
      setTooltipPosition(poistions);
    } else {
      const poistions = {
        top: cellRect.y + 20 + OFFSET_Y,
        left:
          TOOLTIP_WIDTH > cellWidth
            ? cellRect.x + (cellWidth - TOOLTIP_WIDTH) / 2
            : cellRect.x - (TOOLTIP_WIDTH - cellWidth) / 2,
        arrowDirection: "down",
      };

      if (TOOLTIP_WIDTH > cellWidth && WINDOW_WIDTH - cellRect.right < TOOLTIP_WIDTH - cellWidth / 2) {
        poistions.left = cellRect.x - (TOOLTIP_WIDTH - cellWidth);
      }

      if (TOOLTIP_WIDTH > cellWidth && cellRect.left < TOOLTIP_WIDTH - cellWidth / 2) {
        poistions.left = cellRect.x;
      }

      setTooltipPosition(poistions);
    }
  }, [columnRef, cellRef, isTimeZoneDisabled, isBeforeCurrentTime]);

  // Показываем тултип при наведении на десктопе и при клике на мобилах
  const handleMoveCell: React.MouseEventHandler = e => {
    e.preventDefault();

    if (isEditingMode && !isDisabled) return;

    setHoveredUsers(users || [], users?.length == 0 ? true : false);
    setIsTooltipVisible(true);
  };

  const handlePointerLeave: React.PointerEventHandler = e => {
    e.preventDefault();
    setHoveredUsers([], false);
    setIsTooltipVisible(false);
    setTooltipPosition({ top: 0, left: 0, arrowDirection: "" });
  };

  // Пересчитываем позицию при изменении видимости тултипа или скролле
  useEffect(() => {
    if (isTooltipVisible) {
      calculateTooltipPosition();

      const handleCloseTooltip = () => {
        setIsTooltipVisible(false);
        setTooltipPosition({ top: 0, left: 0, arrowDirection: "" });
      };

      window.addEventListener("scroll", handleCloseTooltip, true);
      window.addEventListener("click", handleCloseTooltip, true);
      window.addEventListener("resize", handleCloseTooltip);

      return () => {
        window.removeEventListener("click", handleCloseTooltip, true);
        window.removeEventListener("scroll", handleCloseTooltip, true);
        window.removeEventListener("resize", handleCloseTooltip);
      };
    }
    return;
  }, [isTooltipVisible, users, id, calculateTooltipPosition]);

  // Без такой страшилищи хз как
  const colorCell = useMemo(() => {
    return users?.includes(hoveredUser) || (isEditingMode && newSelectedSlots?.includes(id.split("T")[1]))
      ? "var(--semantics-blue-950)"
      : users?.length && !isEditingMode && !hoveredUser && variableColors?.color
        ? variableColors?.color
        : "var(--fill-bg)";
  }, [id, isEditingMode, newSelectedSlots, users, variableColors, hoveredUser]);

  const colorBorder = useMemo(() => {
    return users?.includes(hoveredUser) || (isEditingMode && newSelectedSlots?.includes(id.split("T")[1]))
      ? "var(--semantics-blue-950)"
      : users?.length && !isEditingMode && !hoveredUser && variableColors?.color
        ? variableColors?.color
        : "var(--semantics-gray-default)";
  }, [id, isEditingMode, newSelectedSlots, users, variableColors, hoveredUser]);

  const hoverColor = useMemo(() => {
    return isEditingMode && newSelectedSlots?.includes(id.split("T")[1])
      ? "var(--semantics-blue-950)"
      : users?.length
        ? variableColors?.hoverColor
        : "var(--semantics-blue-950)";
  }, [isEditingMode, newSelectedSlots, users, variableColors, id]);

  return (
    <div
      style={
        {
          "--bg-color": colorCell,
          "--border-color": colorBorder,
          "--hover-color": hoverColor,
        } as React.CSSProperties
      }
      ref={cellRef}
      onClick={handleMoveCell}
      onPointerMove={handleMoveCell}
      onPointerLeave={handlePointerLeave}
      data-first-cell={isFirstCell}
      data-last-cell={isLastCell}
      data-disabled-cell={isDisabled}
      data-id={id}
      className={styles.TableCell + (isDisabled ? " " + styles.TableCell_disabled : "")}
    >
      {isTooltipVisible && tooltipPosition.left !== 0 && tooltipPosition.top !== 0 && (
        <div
          className={styles.cellTooltip}
          style={{
            position: "fixed",
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
        >
          {tooltipPosition.arrowDirection === "down" ? (
            <ToolTipArrowIcon className={`${styles.cellTooltipArrow__Up}`} />
          ) : null}

          <div className={styles.cellTooltipContent}>
            {isBeforeCurrentTime ? (
              <>
                <span className={styles.cellTooltipDisabled}>Это время из прошлого, его выбрать не получится</span>
              </>
            ) : isTimeZoneDisabled ? (
              <>
                <span className={styles.cellTooltipDisabled}>Это время недоступно из-за смены часовых поясов</span>
              </>
            ) : (
              <>
                <span className={styles.cellTooltipTime}>{timeInterval}</span>
                <span
                  className={styles.cellTooltipCount}
                >{`${users?.length || 0} / ${countAllPeople || 0} участников`}</span>
              </>
            )}
          </div>
          {tooltipPosition.arrowDirection === "up" ? <ToolTipArrowIcon /> : null}
        </div>
      )}
    </div>
  );
};
