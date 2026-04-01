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
