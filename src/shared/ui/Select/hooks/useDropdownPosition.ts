import { useState, useEffect, useCallback } from "react";
import { useFocusTrap } from "../../../libs";

const DROPDOWN_MARGIN = 8;
interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export const useDropdownPosition = (
  inputRef: React.RefObject<HTMLDivElement | null>,
  dropdownRef: React.RefObject<HTMLDivElement | null>,
  name: string,
  onBlur?: (name: string) => void,
  placement: "bottom" | "right" = "bottom",
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>();

  const measureDropdownSize = useCallback((): Promise<{ height: number; width: number }> => {
    return new Promise(resolve => {
      if (!dropdownRef.current) {
        resolve({ height: 0, width: 0 });
        return;
      }

      const tempDiv = document.createElement("div");
      tempDiv.style.position = "absolute";
      tempDiv.style.top = "-9999px";
      tempDiv.style.left = "-9999px";
      tempDiv.style.visibility = "hidden";
      tempDiv.style.pointerEvents = "none";

      const clone = dropdownRef.current.cloneNode(true) as HTMLElement;
      clone.style.right = "auto";
      clone.style.left = "auto";
      clone.style.visibility = "visible";
      tempDiv.appendChild(clone);
      document.body.appendChild(tempDiv);

      const height = clone.offsetHeight;
      const width = clone.offsetWidth;

      document.body.removeChild(tempDiv);

      resolve({ height, width });
    });
  }, [dropdownRef]);

  const calculatePosition = useCallback(async () => {
    const input = inputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const { height: dropdownHeight, width: measuredWidth } = await measureDropdownSize();
    const dropdownWidth = Math.max(measuredWidth, rect.width);

    if (placement === "right") {
      let left = rect.right + DROPDOWN_MARGIN;
      if (left + dropdownWidth > viewportWidth - DROPDOWN_MARGIN) {
        left = rect.left - dropdownWidth - DROPDOWN_MARGIN;
      }
      if (left < DROPDOWN_MARGIN) {
        left = DROPDOWN_MARGIN;
      }

      let top = rect.top;
      if (top + dropdownHeight > viewportHeight - DROPDOWN_MARGIN) {
        top = Math.max(DROPDOWN_MARGIN, viewportHeight - dropdownHeight - DROPDOWN_MARGIN);
      }

      setDropdownPosition({
        top,
        left,
        width: dropdownWidth,
      });
      return;
    }

    const spaceBelow = viewportHeight - rect.bottom;
    const shouldShowBelow = spaceBelow > dropdownHeight + DROPDOWN_MARGIN;

    let top: number;
    if (shouldShowBelow) {
      top = rect.bottom + DROPDOWN_MARGIN;
    } else {
      top = rect.top - dropdownHeight - DROPDOWN_MARGIN;
    }

    setDropdownPosition({
      top,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, [inputRef, measureDropdownSize, placement]);

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
        onBlur?.(name);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, closeDropdown, inputRef, dropdownRef, onBlur, name]);

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
