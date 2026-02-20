import { useEffect, type RefObject, useRef } from "react";

const TABBABLE_ELEMS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), area[href], form, audio[controls], video[controls], [tabindex="0"]';

/**
 * Adds focus trap effect to a given ref.
 */
export const useFocusTrap = <T extends HTMLElement>(
  ref: RefObject<T | null>,
  isActive: boolean, // initial active state
  onEscape?: () => void,
) => {
  //  last focused element BEFORE the focus trap was activated
  const lastFocusedElem = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isActive) {
      const target = ref.current;
      if (!target) return;

      lastFocusedElem.current = document.activeElement as HTMLElement;
      lastFocusedElem.current.blur();

      const focusableElems = target.querySelectorAll(TABBABLE_ELEMS) as NodeListOf<HTMLElement>;
      const numFocusableElems = focusableElems.length;

      if (numFocusableElems === 0)
        throw "At least one tabbable element needs to be present within your target. If you feel this is a mistake and there is a tabbable element on your target, try adding your tabbable element within the optional tabbableElems parameter.";

      const firstElement = focusableElems[0];
      const lastElement = focusableElems[numFocusableElems - 1];

      const handleTab = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onEscape?.();
        }
        if (event.key === "Tab") {
          const focusedElement = document.activeElement as HTMLElement;

          const focusEvent = (elem: HTMLElement) => {
            elem.focus();
            return event.preventDefault();
          };

          if (!event.shiftKey && focusedElement === lastElement) {
            focusEvent(firstElement);
          }
          if (event.shiftKey && focusedElement === firstElement) {
            focusEvent(lastElement);
          }
        }
      };

      target.addEventListener("keydown", handleTab);
      return () => {
        console.log("UNMOUNT");
        // on unmount, focus the last focused elem outside of the target
        lastFocusedElem.current!.focus();

        target.removeEventListener("keydown", handleTab);
      };
    }
    return;
  }, [isActive, ref, onEscape]);
};
