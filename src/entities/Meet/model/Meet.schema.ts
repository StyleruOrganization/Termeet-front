// Schemas and Types

export interface SlotsUser {
  /** Имя пользователя @example "Данек" */
  name: string;
  /** Слоты, выбранные пользователем в формате UTC+0. В случае если встреча состоит из одного слота, то время начала совпадает со временем конца @example [["2026-12-21Т22:00:00Z","2026-12-22Т02:00:00Z"],["2026-12-22Т22:00:00Z","2026-12-23Т02:00:00Z"]] */
  slots: [string, string][];
}

export interface MeetResponse {
  /** Название встречи @example "Встреча" */
  name: string;
  /** Описание встречи @example "Описание встречи" */
  description?: string | null;
  /** Прикрепленная к встрече ссылка @example "https://telemost.360.yandex.ru/j/6694975853" */
  link?: string | null;
  /** Продолжительность встречи @example "01:30" */
  duration?: string | null;
  /** Все слоты для встречи в формате UTC+0. Совпадать не могут. @example [["2026-12-21T22:00:00Z","2026-12-22T02:00:00Z"],["2026-12-22T22:00:00Z","2026-12-23T02:00:00Z"],["2026-12-24T22:00:00Z","2026-12-25T02:00:00Z"]] */
  data_range: [string, string][];
  /** Идентификатор встречи @example "f47ac10b-58cc-4372-a567-0e02b2c3d479" */
  hash: string;
  /** Слоты, выбранные пользователями в формате UTC+0. */
  slots: SlotsUser[];
  /** Является ли пользователь создателем встречи */
  isCreatorAuth: boolean;
  /** Является ли пользователь авторизованным */
  isCreator: boolean;
}

export interface MeetCreate {
  /** Название встречи @example "Встреча" */
  name: string;
  /** Описание встречи @example "Описание встречи" */
  description?: string | null;
  /** Прикрепленная к встрече ссылка @example "https://telemost.360.yandex.ru/j/6694975853" */
  link?: string | null;
  /** Продолжительность встречи @example "01:30" */
  duration?: string | null;
  /** Все слоты для встречи в формате UTC+0. Совпадать не могут. @example [["2026-12-21Т22:00:00Z","2026-12-22Т02:00:00Z"],["2026-12-22Т22:00:00Z","2026-12-23Т02:00:00Z"],["2026-12-24Т22:00:00Z","2026-12-25Т02:00:00Z"]] */
  dataRange: string[][];
}

export interface ApiError {
  /** @example "Something went wrong" */
  message: string;
}
