export interface TableCellProps {
  /**
   * data-id для каждой ячейки
   */
  id: string;
  /**
   * Люди которые выбрали этот слот
   */
  users?: string[];

  /**
   * Показываем как неактивную ячейку(В случаях переходов из-за часовых поясов)
   */
  isDisabled?: boolean;
  /**
   * true если ячейка первая в колонке
   */
  isFirstCell: boolean;
  /**
   * true если ячейка ластовая в колонке
   */
  isLastCell: boolean;
}
