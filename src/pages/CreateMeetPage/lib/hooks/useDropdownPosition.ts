import { useState, useEffect, useCallback } from "react";
import { useFocusTrap } from "@/shared/libs";

const DROPDOWN_HEIGHT = 234;

export const useDropdownPosition = (
  inputRef: React.RefObject<HTMLDivElement | null>,
  dropdownRef: React.RefObject<HTMLDivElement | null>,
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(0);

  const calculatePosition = useCallback(() => {
    const input = inputRef.current;
    if (!input) return;

    const positions = input.getBoundingClientRect();

    const spaceBelow = document.documentElement.clientHeight - positions.bottom;

    console.log("spaceBelow", spaceBelow);
    if (spaceBelow > DROPDOWN_HEIGHT + 8) {
      setDropdownPosition(92);
    } else {
      setDropdownPosition(-214);
    }
  }, [inputRef]);

  const openDropdown = () => {
    calculatePosition();
    setIsOpen(true);
    inputRef.current?.querySelector("input")?.focus();
  };

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
      const isClickInsideInput = input.contains(target);

      if (!isClickInsideInput) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, closeDropdown, inputRef, dropdownRef]);

  useEffect(() => {
    if (!isOpen) return;

    const handleChangePosition = () => {
      calculatePosition();
    };

    window.addEventListener("scroll", handleChangePosition, true);
    window.addEventListener("resize", handleChangePosition);

    return () => {
      window.removeEventListener("scroll", handleChangePosition, true);
      window.removeEventListener("resize", handleChangePosition);
    };
  }, [isOpen, calculatePosition]);

  return {
    isOpen,
    dropdownPosition,
    openDropdown,
    closeDropdown,
  };
};
