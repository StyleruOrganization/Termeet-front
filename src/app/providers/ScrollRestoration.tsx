import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router";

export function ScrollRestoration() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // On back/forward (POP) restore last saved scroll; otherwise always scroll to top
    const savedPosition = sessionStorage.getItem(location.key);
    if (navigationType === "POP") {
      window.scrollTo(0, savedPosition ? parseInt(savedPosition, 10) : 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return () => {
      sessionStorage.setItem(location.key, window.scrollY.toString());
    };
  }, [location, navigationType]);

  return null;
}
