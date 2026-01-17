export const TIMES = generateTimeOptions().map(
  ([hours, minutes]) => `${hours.toString(10).padStart(2, "0")} : ${minutes.toString(10).padStart(2, "0")}`,
);
export const DURATIONS = generateDurationOptions();

function generateTimeOptions(
  fromHour: number = 0,
  toHour: number = 24,
  intervalMinutes: number = 30,
): [number, number][] {
  const times: [number, number][] = [];

  for (let hours = fromHour; hours < toHour; hours++) {
    for (let minutes = 0; minutes < 60; minutes += intervalMinutes) {
      times.push([hours, minutes]);
    }
  }

  return times;
}

function generateDurationOptions() {
  const durations = generateTimeOptions(0, 5, 15)
    .slice(1)
    .map(([hours, minutes]) => {
      return `${hours ? hours + " ч " : ""}${minutes ? minutes + " мин" : ""}`;
    });
  durations.push("5 ч");

  return durations;
}
