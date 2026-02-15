export interface TableColumnProps {
  /**
   * Массив data-id для ячеек
   */
  cellIds: string[];
  /**
   * id столбца
   */
  columnId: string;
  /**
   * Ширина столбца
   */
  columnWidth?: number;
}
