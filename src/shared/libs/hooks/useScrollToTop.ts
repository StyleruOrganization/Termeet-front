export const useScrollToTop = () => () => setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
