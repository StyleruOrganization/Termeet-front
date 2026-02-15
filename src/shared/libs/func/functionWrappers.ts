export const throttle = (func: (...args: unknown[]) => void, waitMs: number) => {
  let timer: NodeJS.Timeout;

  return (...args: unknown[]) => {
    if (timer) return;
    timer = setTimeout(() => {
      clearTimeout(timer);
    }, waitMs);

    func(args);
  };
};

export const debounce = (func: (...args: unknown[]) => void, waitMs: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: unknown[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, waitMs);
  };
};
