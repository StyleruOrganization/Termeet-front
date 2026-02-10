import { useState } from "react";
import { useMeetContext } from "@/shared/hooks/useMeetContext";
import styles from "./TableCell.module.css";
import type { TableCellProps } from "./TableCell.types";

export const TableCell = ({ id, isSelected, opacityPercent, users }: TableCellProps) => {
  const setHoveredUsers = useMeetContext(store => store.setHoveredUsers);
  const isEditingMode = useMeetContext(store => store.isEditing);
  const hoveredUser = useMeetContext(store => store.hoveredUser);
  const [isHovered, setIsHovered] = useState(false);

  const handleCellChoose: React.MouseEventHandler = e => {
    e.preventDefault();
    if (isEditingMode || hoveredUser) return;

    setHoveredUsers(users);
    setIsHovered(true);
  };

  const handlePointerLeave: React.PointerEventHandler = e => {
    e.preventDefault();
    setHoveredUsers([]);
    setIsHovered(false);
  };
  return (
    <div
      style={{
        backgroundColor: isSelected ? `rgba(96, 138, 221, ${opacityPercent}%` : "",
        boxShadow: !isEditingMode && isHovered ? "inset 0 0 0 2px var(--termeet-color-brand-main-dark)" : "",
      }}
      onClick={handleCellChoose}
      onPointerMove={handleCellChoose}
      onPointerLeave={handlePointerLeave}
      data-id={id}
      className={styles.TableCell}
    />
  );
};
