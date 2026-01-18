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
    date: z
      .object({
        start: z.date(),
        end: z.date(),
      })
      .optional(),
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
  );

type NestedKeyOf<Obj extends object> = {
  [Key in keyof Obj & (string | number)]: Obj[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<Obj[Key]>}`
    : `${Key}`;
}[keyof Obj & (string | number)];

export type Meeting = z.infer<typeof meetingSchema>;
export type MeetingKeys = NestedKeyOf<Meeting>;
