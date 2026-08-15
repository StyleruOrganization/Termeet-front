import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import CrossIcon from "@assets/icons/cross.svg";
import styles from "./ModalWrapper.module.css";
import { useFocusTrap } from "../../libs/hooks/useFocusTrap";
import type { IModalWrapperProps } from "./ModalWrapper.types";

const SHEET_MEDIA = "(max-width: 767px), (hover: none) and (pointer: coarse)";
const SHEET_CLOSE_PX = 80;

const useSheetMode = () => {
  const [isSheet, setIsSheet] = useState(() => window.matchMedia(SHEET_MEDIA).matches);

  useEffect(() => {
    const media = window.matchMedia(SHEET_MEDIA);
    const onChange = () => setIsSheet(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return isSheet;
};

export const ModalWrapper = ({
  isOpen,
  onClose,
  children,
  className = "",
  isAnimate = false,
  animationDuration = 300,
  scrollbarWidth = window.innerWidth - document.documentElement.clientWidth,
  compact = false,
  flushTop = false,
}: IModalWrapperProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setVisible] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragY = useRef(0);
  const dragging = useRef(false);
  const isSheet = useSheetMode();
  const shouldAnimate = isAnimate || isSheet;

  const clearSheetDrag = () => {
    const sheet = sheetRef.current;
    if (!sheet) {
      return;
    }
    sheet.style.transform = "";
    sheet.style.transition = "";
  };

  const handleClose = useCallback(() => {
    const sheet = sheetRef.current;
    if (sheet && isSheet) {
      sheet.style.transition = `transform ${animationDuration}ms ease-out`;
      sheet.style.transform = "translateY(100%)";
    }
    if (shouldAnimate) {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      setIsAnimating(true);
      setVisible(false);
      closeTimeoutRef.current = setTimeout(() => {
        closeTimeoutRef.current = null;
        if (sheet) {
          sheet.style.transform = "";
          sheet.style.transition = "";
        }
        onClose();
        setIsAnimating(false);
      }, animationDuration);
    } else {
      onClose();
    }
  }, [animationDuration, isSheet, onClose, shouldAnimate]);

  useFocusTrap(modalRef, isOpen, handleClose);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose],
  );

  const handleSheetPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSheet) {
      return;
    }
    dragging.current = true;
    dragStartY.current = event.clientY;
    dragY.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSheetPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current || !sheetRef.current) {
      return;
    }
    const nextY = Math.max(0, event.clientY - dragStartY.current);
    dragY.current = nextY;
    sheetRef.current.style.transition = "none";
    sheetRef.current.style.transform = `translateY(${nextY}px)`;
  };

  const handleSheetPointerUp = () => {
    if (!dragging.current) {
      return;
    }
    dragging.current = false;
    if (dragY.current > SHEET_CLOSE_PX) {
      handleClose();
      return;
    }
    clearSheetDrag();
  };

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
        ref={sheetRef}
        className={`${styles.ModalWrapper__ModalContainer} ${compact ? styles.ModalWrapper__ModalContainer_compact : ""} ${flushTop ? styles.ModalWrapper__ModalContainer_flushTop : ""} ${isOpen && isVisible ? styles.ModalWrapper__ModalContainer_Opened : ""}`}
        role='dialog'
        aria-modal='true'
        aria-hidden={!isOpen}
      >
        <div
          className={styles.ModalWrapper__Handle}
          onPointerDown={handleSheetPointerDown}
          onPointerMove={handleSheetPointerMove}
          onPointerUp={handleSheetPointerUp}
          onPointerCancel={handleSheetPointerUp}
        >
          <span className={styles.ModalWrapper__HandleBar} />
        </div>
        <button
          data-test-id='close-modal'
          className={styles.ModalWrapper__CloseButton}
          onClick={handleClose}
          aria-label='Закрыть модальное окно'
        >
          <CrossIcon />
        </button>

        <div className={styles.ModalWrapper__SheetBody}>{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, container);
};
