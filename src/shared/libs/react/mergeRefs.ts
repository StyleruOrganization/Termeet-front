import type { Ref, RefCallback, RefObject } from "react";

export function mergeRefs<T>(...refs: Array<Ref<T> | undefined | null>): RefCallback<T> {
  return (instance: T | null) => {
    refs.forEach(ref => {
      if (typeof ref === "function") {
        ref(instance);
      } else if (ref && typeof ref === "object") {
        (ref as RefObject<T | null>).current = instance;
      }
    });
  };
}
