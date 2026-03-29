import { useMemo } from "react";
import { useMeetStore } from "@entities/Meet";
import styles from "./TableCell.module.css";
import { useColorPalette } from "../../lib";
import type { TableCellProps } from "./TableCell.types";

export const TableCell = ({ id, users, isDisabled, isFirstCell, isLastCell }: TableCellProps) => {
  const setHoveredUsers = useMeetStore(store => store.setHoveredUsers),
    isEditingMode = useMeetStore(store => store.isEditing),
    hoveredUser = useMeetStore(store => store.hoveredUser),
    newSelectedSlots = useMeetStore(store => store.newSelectedSlots.get(id.split("T")[0])),
    allUsers = useMeetStore(store => store.users);

  // const countAllPeople = allUsers?.length;
  // const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const variableColors = useColorPalette({
    countSelectPerson: users?.length || 0,
  });

  // Обработчик для мобилы
  const handleCellChoose: React.MouseEventHandler = e => {
    e.preventDefault();
    if (isEditingMode || hoveredUser) return;

    setHoveredUsers(users || []);
  };

  const handlePointerLeave: React.PointerEventHandler = e => {
    e.preventDefault();
    setHoveredUsers([]);
  };

  // Без такой страшилищи хз как
  const colorCell = useMemo(() => {
    return users?.includes(hoveredUser) || (isEditingMode && newSelectedSlots?.includes(id.split("T")[1]))
      ? "var(--light-semantics-dark-blue-default)"
      : users?.length && !isEditingMode && !hoveredUser && variableColors?.color
        ? variableColors?.color
        : "var(--light-fill-bg)";
  }, [id, isEditingMode, newSelectedSlots, users, variableColors, hoveredUser]);

  const colorBorder = useMemo(
    () => {
      return users?.includes(hoveredUser) || (isEditingMode && newSelectedSlots?.includes(id.split("T")[1]))
        ? "var(--light-semantics-dark-blue-default)"
        : users?.length && !isEditingMode && !hoveredUser && variableColors?.color
          ? variableColors?.color
          : "var(--light-semantics-gray-default)";
    },
    [id, isEditingMode, newSelectedSlots, users, variableColors, hoveredUser],
    id,
  );

  const hoverColor = useMemo(() => {
    return isEditingMode && newSelectedSlots?.includes(id.split("T")[1])
      ? "var(--light-semantics-light-blue-disabled)"
      : users?.length
        ? variableColors?.hoverColor
        : "var(--light-semantics-dark-blue-default)";
  }, [isEditingMode, newSelectedSlots, users, variableColors, id]);

  if (users?.length) {
    console.log(
      `colors in cell ${id}`,
      "hoverColor",
      hoverColor,
      "colorBorder",
      colorBorder,
      "colorCell",
      colorCell,
      "variableColors",
      variableColors,
      "users.length",
      users.length,
      "allUsers",
      allUsers,
    );
  }

  return (
    <div
      style={
        {
          "--bg-color": colorCell,
          "--border-color": colorBorder,
          "--hover-color": hoverColor,
          // "position": isTooltipVisible ? "relative" : "static",
        } as React.CSSProperties
      }
      data-first-cell={isFirstCell}
      data-last-cell={isLastCell}
      onClick={handleCellChoose}
      onPointerMove={handleCellChoose}
      onPointerLeave={handlePointerLeave}
      data-id={id}
      className={styles.TableCell + (isDisabled ? " " + styles.TableCell_disabled : "")}
    >
      {/* {isTooltipVisible ? <div className={styles.cellTooltip}></div> : null} */}
    </div>
  );
};
