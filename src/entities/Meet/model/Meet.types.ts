export interface IMeet {
  name: string;
  description?: string;
  link?: string;
  /**
    @example  HH:MM
  */
  duration?: string;
  /**
   * Дни в которые проходит встреча
    @example  ["2026-02-03"]
  */
  meeting_days: string[];
  /**
   * Для бокового времени, промежутки который могут быть во всех днях. Максимум два.
   */
  timeRanges: [string, string][];
  /**
   * Все пользователи которые голосовали
   */
  users: string[];
  /**
   * Кто из списка сохранил слоты из аккаунта
   */
  userAuth: Record<string, boolean>;
  organizerName: string | null;
  observers: string[];
  anyoneCanEdit: boolean;
  anyoneCanDeleteParticipants: boolean;
  requireLoginToVote: boolean;
  permissions: {
    canEditMeet: boolean;
    canDeleteParticipants: boolean;
    canEditSettings: boolean;
    canVote: boolean;
    canObserve: boolean;
    isObserver: boolean;
  };
  /**
   * Ключ - дата, значение - промежутки которые могут быть выбраны пользователем. Максимум два. (Смещения из-за часовых поясов)
   * И слоты - мапа ключ - время, значение - массив пользователей
   */
  timeInfo: Map<string, { timeRanges: [string, string][]; userSlots: Map<string, string[]> }>;

  isCreatorAuth: boolean;
  isCreator: boolean;
  /**
   * Имя, под которым текущий залогиненный пользователь уже сохранил слоты.
   * Гость и человек без своих слотов — null.
   */
  mySlotName: string | null;
}

export interface IMeetStore {
  /**
   * Сохраняем новые слоты только что выбранные
   */
  setSelectNewSell: (date: string, time: string, isRemove?: boolean) => void;
  /**
   * Сохраняем юзеров которых нужно подсветить при наведении на слот
   */
  setHoveredUsers: (users: string[], isEmptySlot: boolean) => void;
  /**
   * Сохраняем юзера чьи слоты нужно подсветить
   */
  setHoveredUser: (user: string) => void;
  /**
   * Режим работы с календарем
   */
  setIsEditing: (isEditing: boolean) => void;
  /**
   * Вход в режим выбора слотов. Если передано имя — подставляем уже сохранённые слоты этого участника.
   * preset — готовая сетка (шаблон времени), без сохранения на сервер.
   */
  startEditingSlots: (userName?: string | null, preset?: Map<string, string[]>) => void;
  /**
   * Очищаем новые выбранные слоты
   */
  clearNewSelectedSlots: () => void;
  /**
   * Модалка для имени пользователя
   */
  setIsModalOpen: (isOpen: boolean) => void;
  /**
   *  Готовим слоты для бека, делаем отрезки из мапы
   */
  getPreparedNewSlots: () => [string, string][];
  /**
   * Получаем новые слоты в виде мапы
   */
  getNewSelectedSlots: () => IMeetStore["newSelectedSlots"];
  // Для отптимистичных обновлений
  setUsers: (users: string[]) => void;
  setTimeInfo: (timeInfo: IMeet["timeInfo"]) => void;
  /**
   * Пользователь успешно добавил свое время
   */
  setTimeIsAdded: () => void;
  // _+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+_+
  /**
   * Слоты пользователя с бека, подготовленные
   */
  timeInfo: IMeet["timeInfo"];
  /**
   * Слоты пользователя с бека, подготовленные
   */
  timeRanges: IMeet["timeRanges"];
  /**
   * Все пользователи которые проголосовали
   */
  users: IMeet["users"];
  /**
   * Юзер пока не известен поэтому просто Map
   * Выбранные пользователем слоты
   */
  newSelectedSlots: Map<string, string[]>;
  /**
   * true если пользователь выбирает время
   */
  isEditing: boolean;
  /**
   * Пользователи которых нужно выделить при наведении на слот
   */
  hoveredUsers: {
    users: string[];
    isEmptySlot: boolean;
  };
  /**
   * Чьи слоты подсветить
   */
  hoveredUser: string;
  isModalOpen: boolean;
  timeIsAdded: boolean;
}
