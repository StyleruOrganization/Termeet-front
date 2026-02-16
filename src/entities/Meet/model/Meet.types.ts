export interface Meet {
  id: number;
  name: string;
  description?: string;
  link?: string;
  hash: string;
  /**
    @example  HH:MM
  */
  duration: string;
  /**
    @example  ["2026-02-03"]
  */
  meeting_days: string[];
  /**
    @example  09:00:00
  */
  start_time: string;
  /**
    @example  17:00:00
  */
  end_time: string;
}

// Слот не может быть в двух разных днях, ага, хер там, может, потом будем с этим разбираться
type Slot = {
  /**
   * @example  2026-02-03T07:00:00Z
   */
  start_time: string;
  /**
   * @example  2026-02-03T17:00:00Z
   */
  end_time: string;
};

export interface IMeetInfo {
  meeting: Meet;
  // Мб добавить какой-то айдишник для каждого юзера
  userSlots: { user: string; slots: Slot[] }[];
}

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
