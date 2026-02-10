// key - дата ("2026-02-03"), value - Map где ключ время, значение - массив пользователей для этого времени
export type SelectedSlots = Map<string, Map<string, string[]>>;

export interface IMeetContext {
  // getColumn: (columnId: string) => Map<string, string[]>;
  setSelectNewSell: (date: string, time: string, isRemove?: boolean) => void;
  saveNewSelectedSlots: (userName: string) => void;
  setHoveredUsers: (users: string[]) => void;
  setHoveredUser: (user: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  clearNewSelectedSlots: () => void;
  // Модалка для имени пользователя
  setIsModalOpen: (isOpen: boolean) => void;
  // _+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+

  // Юзер пока не известен поэтому просто Map
  newSelectedSlots: Map<string, string[]>;
  /**
   * Старые слоты с бека, которые пришли
   */
  oldSelectedSlots: SelectedSlots;
  /**
   * Максимальное кол-во людей выбравших одно время
   */
  maxSelectCount: number;
  /**
   * true если пользователь выбирает время
   */
  isEditing: boolean;
  /**
   * Пользователи которые уже проголосовали
   */
  users: string[];
  /**
   * Пользователи которых нужно выделить при наведении на слот
   */
  hoveredUsers: string[];
  /**
   * Чьи слоты подсветить
   */
  hoveredUser: string;
  isModalOpen: boolean;
}
