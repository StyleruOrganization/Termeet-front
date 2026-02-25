import React, { useEffect, useState, useCallback, useRef } from "react";
import { CrossIcon } from "@assets/icons/cross";
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
    let prev = document.body.style.overflow;
    if (isOpen) {
      prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen, isAnimating]);

  useEffect(() => {
    setTimeout(() => {
      if (isOpen) {
        setVisible(true);
      } else {
        handleClose();
      }
    });
  }, [isOpen, handleClose]);

  if (!isOpen && !isAnimating && !isVisible) {
    return null;
  }

  return (
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
      >
        <button data-test-id='close-modal' className={styles.ModalWrapper__CloseButton} onClick={handleClose}>
          <CrossIcon />
        </button>

        <div className={styles.ModalWrapper__ModalContent}>{children}</div>
      </div>
    </div>
  );
};
