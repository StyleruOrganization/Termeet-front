export interface IModalWrapperProps extends React.PropsWithChildren {
  /** Состояние открытия модального окна */
  isOpen: boolean;
  /** Функция закрытия модального окна */
  onClose: () => void;
  /** Класс для дополнительного стиля контейнера */
  className?: string;
  /** Длительность анимации закрытия */
  animationDuration?: number;
  /** Делаем ли анимацию при закрытии/открытии */
  isAnimate?: boolean;
}
