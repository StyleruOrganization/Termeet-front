import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import CrossIcon from "@assets/icons/cross.svg";
import styles from "./ModalWrapper.module.css";
import { useFocusTrap } from "../../libs/hooks/useFocusTrap";
import type { IModalWrapperProps } from "./ModalWrapper.types";

export const ModalWrapper = ({
  isOpen,
  onClose,
  children,
  className = "",
  isAnimate = false,
  animationDuration = 300,
  scrollbarWidth,
}: IModalWrapperProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Обработчик закрытия с анимацией
  const handleClose = useCallback(() => {
    if (isAnimate) {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      setIsAnimating(true);
      setVisible(false);
      closeTimeoutRef.current = setTimeout(() => {
        closeTimeoutRef.current = null;
        onClose();
        setIsAnimating(false);
      }, animationDuration);
    } else {
      onClose();
    }
  }, [onClose, isAnimate, animationDuration]);

  useFocusTrap(modalRef, isOpen, handleClose);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Обработчик клика на оверлей
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose],
  );

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    if (isOpen && !isAnimating) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.paddingRight = "0";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isAnimating, scrollbarWidth]);

  // Управление видимостью для анимации
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating && !isVisible) {
    return null;
  }

  // Получаем контейнер для портала
  const container = document.body;

  const modalContent = (
    <div
      className={`${styles.ModalWrapper__Overlay} ${isOpen && isVisible ? styles.ModalWrapper__Overlay_visible : ""} ${className}`}
      onClick={handleOverlayClick}
      style={
        {
          "--animation-duration": `${animationDuration}ms`,
        } as React.CSSProperties
      }
      ref={modalRef}
    >
      <div
        className={`${styles.ModalWrapper__ModalContainer} ${isOpen && isVisible ? styles.ModalWrapper__ModalContainer_Opened : ""}`}
        role='dialog'
        aria-modal='true'
        aria-hidden={!isOpen}
      >
        <button
          data-test-id='close-modal'
          className={styles.ModalWrapper__CloseButton}
          onClick={handleClose}
          aria-label='Закрыть модальное окно'
        >
          <CrossIcon />
        </button>

        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, container);
};
