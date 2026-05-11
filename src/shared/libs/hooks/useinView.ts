import { useEffect, useState } from "react";

export function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.5) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenSeen, setHasBeenSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasBeenSeen(true);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return { isVisible, hasBeenSeen };
}
