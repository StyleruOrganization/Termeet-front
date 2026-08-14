/**
 * «30 мин», «1 час», «1,5 часа» → минуты. Пустая или неизвестная строка → 0.
 */
export const durationToMinutes = (duration: string): number => {
  const normalized = duration.trim().toLowerCase();

  if (normalized.includes("мин")) {
    const value = parseFloat(normalized.replace("мин", "").trim());
    return Number.isFinite(value) ? value : 0;
  }

  if (normalized.includes("час")) {
    const value = parseFloat(normalized.replace("часа", "").replace("час", "").trim().replace(",", "."));
    return Number.isFinite(value) ? value * 60 : 0;
  }

  return 0;
};

/** Сколько ячеек по 30 мин влезает в продолжительность. Нет продолжительности — без лимита. */
export const maxFinalCells = (duration?: string | null): number | null => {
  if (!duration?.trim()) {
    return null;
  }
  const minutes = durationToMinutes(duration);
  if (!minutes) {
    return null;
  }
  return Math.max(1, Math.floor(minutes / 30));
};
