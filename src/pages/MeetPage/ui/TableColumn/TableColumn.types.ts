export interface TableColumnProps {
  /**
   * id столбца
   */
  columnId: string;
  /**
   * Ширина столбца
   */
  columnWidth?: number;
  /**
   * Промежутки времени для всех дней
   */
  timeRanges: [string, string][];
}
