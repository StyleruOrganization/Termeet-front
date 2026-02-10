export interface Meet {
  id: number;
  name: string;
  description?: string;
  link?: string;
  hash: string; // хз, вроде не нужен
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

// Слот не может быть в двух разных днях
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

export interface IMeetingInfo {
  meeting: Meet;
  // Мб добавить какой-то айдишник для каждого юзера
  userSlots: { user: string; slots: Slot[] }[];
}
