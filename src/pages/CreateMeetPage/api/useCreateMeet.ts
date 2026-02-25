import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { apiClient } from "@/shared/api";
import { meetCreateSchema, type MeetCreate, meetResponseSchema, type MeetResponse } from "@entities/Meet";
import type { ICreateMeet } from "../model";

function parseDuration(duration?: string): string | null {
  if (!duration) {
    return null;
  }
  const cleanText = duration.toLowerCase().trim();

  let hours = 0;
  let minutes = 0;

  const hoursMatch = cleanText.match(/(\d+)\s*ч/);
  if (hoursMatch) {
    hours = parseInt(hoursMatch[1], 10);
  }

  const minutesMatch = cleanText.match(/(\d+)\s*мин/);
  if (minutesMatch) {
    minutes = parseInt(minutesMatch[1], 10);
  }

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
}

const prepareDateRanges = (dates: string[], start_time: string, end_time: string) => {
  start_time = start_time.replace(/\s/g, "");
  end_time = end_time.replace(/\s/g, "");

  return dates.map(date => [
    new Date(`${date}T${start_time}:00`).toISOString(),
    new Date(`${date}T${end_time}:00`).toISOString(),
  ]);
};

export const useCreateMeet = ({ onSuccess: onSuccessExternal }: { onSuccess: () => void }) => {
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: (data: MeetCreate) => apiClient.post<MeetResponse, MeetCreate>("/meet/create", data, meetCreateSchema),
    onSuccess: (response: MeetResponse) => {
      const validationRes = meetResponseSchema.safeParse(response);
      if (!validationRes.success) {
        console.error("❌ Ошибка валидации данных в ответе при создании встречи:", {
          error: validationRes.error.issues[0].message,
          path: validationRes.error.issues[0].path,
          timestamp: new Date().toISOString(),
        });
      }
      onSuccessExternal();
      navigate(`/meet/${response.hash}`);
    },
  });

  const createMeet = (formData: ICreateMeet) => {
    const preparedData: MeetCreate = {
      name: formData.title.trim(),
      description: formData.description?.trim(),
      link: formData.link?.trim() || null,
      duration: parseDuration(formData.time.duration),
      timeRange: prepareDateRanges(formData.date, formData.time.start, formData.time.end),
    };

    mutate(preparedData);
  };

  return { createMeet, isPending };
};
