export interface TableCellProps {
  /**
   * data-id для каждой ячейки
   */
  id: string;
  isSelected?: boolean;
  /**
   * Насколько прозрачной делаем клетку
   */
  opacityPercent?: number;
  /**
   * Люди которые выбрали это время
   */
  users?: string[];

  /**
   * Показываем как неактивную ячейку
   */
  isDisabled?: boolean;
  isShowBefore?: boolean;
  isShowAfter?: boolean;
}
