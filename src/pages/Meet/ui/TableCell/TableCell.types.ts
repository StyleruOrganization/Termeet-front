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
   * Показываем как неактивную ячейку (В случаях переходов из-за часовых поясов)
   */
  isTimeZoneDisabled?: boolean;
  /**
   * Если время раньше текущего
   */
  isBeforeCurrentTime?: boolean;
  /**
   * true если ячейка первая в колонке
   */
  isFirstCell: boolean;
  /**
   * true если ячейка ластовая в колонке
   */
  isLastCell: boolean;
  /**
   * ссылка на колонку, чтобы тултипчик норм показывать
   */
  columnRef: React.RefObject<HTMLDivElement | null>;
}
