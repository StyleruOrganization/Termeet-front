const parseLocalDateTime = (cellId: string): Date | null => {
  const [datePart, timePart] = cellId.split("T");
  if (!datePart || !timePart) {
    return null;
  }
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  if (![year, month, day, hours, minutes].every(Number.isFinite)) {
    return null;
  }
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

export const startOfToday = (now = new Date()) => new Date(now.getFullYear(), now.getMonth(), now.getDate());

export const isDateBeforeToday = (date: Date, now = new Date()) => {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return day.getTime() < startOfToday(now).getTime();
};

export const isSlotInPast = (cellId: string, now = Date.now()) => {
  const slot = parseLocalDateTime(cellId);
  if (!slot) {
    return false;
  }
  return slot.getTime() < now;
};
