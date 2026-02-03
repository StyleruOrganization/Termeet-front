import { useRef, useState } from "react";
import styles from "./TableColumn.module.css";
import { TableCell } from "../TableCell";
import type { TableColumnProps } from "./TableColumn.types";

export const TableColumn = ({ cells }: TableColumnProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Set<string | null>>(new Set<string>());

  const handlePointerUp = () => {
    console.log("select end TableColumn");
    setIsSelecting(false);
    setIsRemoving(false);
  };

  const handleSelectStart = ({ isRemoving }: { isRemoving: boolean }) => {
    console.log("select start in TableColumn");
    setIsSelecting(true);
    setIsRemoving(isRemoving);
  };

  return (
    <div
      onTouchStart={e => {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
        if (!element) return;
        const dataId = element.getAttribute("data-id");
        console.log("tpuchStart in tableColumn", dataId);

        setIsSelecting(true);
        if (dataId && selectedCells.has(dataId)) {
          setIsRemoving(true);
        }

        if (isRemoving) {
          setSelectedCells(prev => {
            const newSet = new Set(prev);
            newSet.delete(dataId);
            return newSet;
          });
        } else {
          setSelectedCells(prev => {
            const newSet = new Set(prev);
            newSet.add(dataId);
            return newSet;
          });
        }
      }}
      onTouchMove={e => {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!element) return;
        const dataId = element.getAttribute("data-id");
        if (isRemoving) {
          setSelectedCells(prev => {
            const newSet = new Set(prev);
            newSet.delete(dataId);
            return newSet;
          });
        } else {
          setSelectedCells(prev => {
            const newSet = new Set(prev);
            newSet.add(dataId);
            return newSet;
          });
        }
        console.log("touchMove in touchCollumn", dataId);
      }}
      onTouchEnd={e => {
        console.log("touchEnd in touchColumn");

        setIsSelecting(false);
        setIsRemoving(false);
      }}
      // onPointerUp={handlePointerUp}
      className={styles.TableColumn}
    >
      {cells.map((cell, index) => (
        <TableCell id={cell} key={index} isSelected={selectedCells.has(cell)} />
      ))}
    </div>
  );
};
