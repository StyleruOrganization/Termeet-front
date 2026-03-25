import { useState, useEffect, useCallback } from "react";
import { useFocusTrap } from "@/shared/libs";

const DROPDOWN_MARGIN = 8;
interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export const useDropdownPosition = (
  inputRef: React.RefObject<HTMLDivElement | null>,
  dropdownRef: React.RefObject<HTMLDivElement | null>,
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>();

  // Измеряем высоту дропдауна перед открытием
  const measureDropdownHeight = useCallback((): Promise<number> => {
    return new Promise(resolve => {
      if (!dropdownRef.current) {
        resolve(0);
        return;
      }

      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.top = "-9999px";
      tempDiv.style.left = "-9999px";
      tempDiv.style.visibility = "hidden";
      tempDiv.style.pointerEvents = "none";

      const clone = dropdownRef.current.cloneNode(true) as HTMLElement;
      tempDiv.appendChild(clone);
      document.body.appendChild(tempDiv);

      const height = clone.offsetHeight;

      document.body.removeChild(tempDiv);

      resolve(height);
    });
  }, [dropdownRef]);

  const calculatePosition = useCallback(async () => {
    const input = inputRef.current;
    if (!input) return;
    // Получаем позицию именно input элемента
    const rect = input.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const DROPDOWN_HEIGHT = await measureDropdownHeight();

    const shouldShowBelow = spaceBelow > DROPDOWN_HEIGHT + DROPDOWN_MARGIN;

    let top: number;
    if (shouldShowBelow) {
      top = rect.bottom + DROPDOWN_MARGIN;
    } else {
      top = rect.top - DROPDOWN_HEIGHT - DROPDOWN_MARGIN;
    }

    setDropdownPosition({
      top,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, [inputRef, measureDropdownHeight]);

  const openDropdown = useCallback(() => {
    calculatePosition();
    setIsOpen(true);
    inputRef.current?.focus();
  }, [inputRef, calculatePosition]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  useFocusTrap(dropdownRef, isOpen, closeDropdown);

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isOpen) return;

      const input = inputRef.current;

      if (!input) return;

      const target = event.target as Node;
      // И там и там проверяем так как дропдаун fixed
      const isClickInsideInput = input.contains(target);
      const isClickInsideDropdown = dropdownRef.current?.contains(target);

      if (!isClickInsideInput && !isClickInsideDropdown) {
        closeDropdown();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, closeDropdown, inputRef, dropdownRef]);

  useEffect(() => {
    if (!isOpen) return;

    const handleChangePosition = (event: Event) => {
      const target = event.target as HTMLElement;

      if (!target || !(target instanceof Node)) {
        calculatePosition();
        return;
      }

      const isScrollingDropdown = dropdownRef.current?.contains(target);
      if (!isScrollingDropdown) {
        calculatePosition();
      }
    };

    window.addEventListener("scroll", handleChangePosition, true);
    window.addEventListener("resize", handleChangePosition);

    return () => {
      window.removeEventListener("scroll", handleChangePosition, true);
      window.removeEventListener("resize", handleChangePosition);
    };
  }, [isOpen, calculatePosition, dropdownRef]);

  return {
    isOpen,
    dropdownPosition,
    openDropdown,
    closeDropdown,
  };
};
