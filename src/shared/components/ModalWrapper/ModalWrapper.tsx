import React, { useEffect, useState, useCallback } from "react";
import { CrossIcon } from "@/assets/icons/cross";
import styles from "./ModalWrapper.module.css";
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

  // Обработчик закрытия с анимацией
  const handleClose = useCallback(() => {
    if (isAnimate) {
      setIsAnimating(true);
      setVisible(false);
      // Ждем завершения анимации закрытия перед вызовом onClose
      setTimeout(() => {
        onClose();
        setIsAnimating(false);
      }, animationDuration);
    } else {
      onClose();
    }
  }, [onClose, isAnimate, animationDuration]);

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
    },
    [handleClose],
  );

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

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = prev;
    };
  }, [isOpen, isAnimating, handleEscape]);

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
    >
      <div
        className={`${styles.ModalWrapper__ModalContainer} ${isOpen && isVisible ? styles.ModalWrapper__ModalContainer_Opened : ""}`}
        role='dialog'
        aria-modal='true'
      >
        <button className={styles.ModalWrapper__CloseButton} onClick={handleClose}>
          <CrossIcon />
        </button>

        <div className={styles.ModalWrapper__ModalContent}>{children}</div>
      </div>
    </div>
  );
};
