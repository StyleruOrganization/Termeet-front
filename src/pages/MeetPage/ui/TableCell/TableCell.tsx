import { useMemo } from "react";
import { useMeetStore } from "@entities/Meet";
import styles from "./TableCell.module.css";
import { useColorPalette } from "../../lib";
import type { TableCellProps } from "./TableCell.types";

export const TableCell = ({ id, users, isDisabled }: TableCellProps) => {
  const setHoveredUsers = useMeetStore(store => store.setHoveredUsers),
    isEditingMode = useMeetStore(store => store.isEditing),
    hoveredUser = useMeetStore(store => store.hoveredUser),
    newSelectedSlots = useMeetStore(store => store.newSelectedSlots.get(id.split("T")[0]));

  const variableColors = useColorPalette({
    countSelectPerson: users?.length || 0,
  });

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
      : users?.length && !isEditingMode && !hoveredUser
        ? variableColors.color
        : "white";
  }, [id, isEditingMode, newSelectedSlots, users, variableColors, hoveredUser]);

  const colorBorder = useMemo(() => {
    return users?.includes(hoveredUser) || (isEditingMode && newSelectedSlots?.includes(id.split("T")[1]))
      ? "var(--light-semantics-dark-blue-default)"
      : users?.length && !isEditingMode && !hoveredUser
        ? variableColors.color
        : "var(--light-semantics-gray-default)";
  }, [id, isEditingMode, newSelectedSlots, users, variableColors, hoveredUser]);

  return (
    <div
      style={
        {
          "backgroundColor": colorCell,
          "borderColor": colorBorder,
          "--hover-color": variableColors.borderColor,
        } as React.CSSProperties
      }
      onClick={handleCellChoose}
      onPointerMove={handleCellChoose}
      onPointerLeave={handlePointerLeave}
      data-id={id}
      className={styles.TableCell + (isDisabled ? " " + styles.TableCell_disabled : "")}
    />
  );
};
