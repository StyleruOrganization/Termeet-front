import { TableColumn } from "./../TableColumn";
import styles from "./MeetTable.module.css";
import { getCellIds } from "./MeetTable.utils/getCellsIds";
import type { MeetTableProps } from "./MeetTable.types";

const columns = [
  ["Cell1", "Cell2", "Cell3"],
  ["Cell4", "Cell5", "Cell6"],
  ["Cell7", "Cell8", "Cell9"],
];

export const MeetTable = ({ start_time, end_time, meeting_days }: MeetTableProps) => {
  const cellIds = getCellIds({ start_time, end_time, meeting_days });
  return (
    <div className={styles.MeetTable}>
      {Object.keys(cellIds).map((column, index) => (
        <TableColumn key={index} cells={cellIds[column]} />
      ))}
    </div>
  );
};
