import { z } from "zod";

const validationTime = (startTime: string) => {
  const [hours, minutes] = startTime.split(" : ").map(Number);

  if (hours > 23 || minutes > 59) {
    return false;
  }
  return true;
};

export const meetingSchema = z
  .object({
    title: z.string().min(1, "Название встречи обязательно"),
    description: z.string().min(1, "Описание встречи обязательно"),
    link: z.union([z.url("Неверный формат ссылки"), z.literal(""), z.undefined()]).optional(),
    time: z.object({
      start: z
        .string()
        .min(1, "Начало обязательно")
        .regex(/^([0-1][0-9]|2[0-3]) : [0-5][0-9]$/, "Неверный формат времени")
        .refine(validationTime, {
          message: "Проверьте, корректность начала встречи",
        }),
      end: z
        .string()
        .min(1, "Конец обязателен")
        .regex(/^([0-1][0-9]|2[0-3]) : [0-5][0-9]$/, "Неверный формат времени")
        .refine(validationTime, {
          message: "Проверьте, корректность конца встречи",
        }),
      duration: z.string().optional(),
    }),
    date: z.array(z.string(), "Нужно выбрать хотя бы один день").min(1, "Нужно выбрать хотя бы один день"),
  })
  .refine(
    data => {
      const [startHours, startMinutes] = data.time.start.split(" : ");
      const [endHours, endMinutes] = data.time.end.split(" : ");
      const startTime = parseInt(startHours) * 60 + parseInt(startMinutes);
      const endTime = parseInt(endHours) * 60 + parseInt(endMinutes);

      return startTime < endTime;
    },
    {
      path: ["time", "start"],
      message: "Начало встречи должно быть раньше конца",
    },
  )
  .refine(
    data => {
      if (!data.time.duration) {
        return true;
      }
      const normalized = data.time.duration.toLowerCase().trim();
      let durationMinutes = 0;

      const DURATION_REGEX = /^(?:(\d+)\s*ч)?(?:\s*(\d+)\s*мин)?$/;

      if (DURATION_REGEX.test(normalized)) {
        const match = normalized.match(DURATION_REGEX);
        console.log(match);
        if (match) {
          const hours = parseInt(match[1]) || 0;
          const minutes = parseInt(match[2]) || 0;
          durationMinutes = hours * 60 + minutes;
        }
      }
      const [startHours, startMinutes] = data.time.start.split(" : ");
      const [endHours, endMinutes] = data.time.end.split(" : ");
      const startTime = parseInt(startHours) * 60 + parseInt(startMinutes);
      const endTime = parseInt(endHours) * 60 + parseInt(endMinutes);

      return durationMinutes <= endTime - startTime;
    },
    {
      path: ["time", "duration"],
      message: "Продолжительность встречи не корректна",
    },
  );

export type Meeting = z.infer<typeof meetingSchema>;
export type MeetingKeys =
  | "title"
  | "description"
  | "link"
  | "time"
  | "date"
  | "time.start"
  | "time.end"
  | "time.duration";
