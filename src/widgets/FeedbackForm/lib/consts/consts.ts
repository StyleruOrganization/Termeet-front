import type { FeedbackType, CommunicationChannel } from "../../api/useSendFeedBack";

export const FEEDBACK_REASONS = ["Нужна помощь", "Есть предложение", "Нашел баг", "Хочу сотрудничать", "Другое"];

export const CHANELLS = ["Telegram", "Email"];

export const REASON_TO_API: Record<string, FeedbackType> = {
  "Нужна помощь": "HELP",
  "Есть предложение": "SUGGESTION",
  "Нашел баг": "BUG",
  "Хочу сотрудничать": "PARTNERSHIP",
  "Другое": "OTHER",
};

export const CHANNEL_TO_API: Record<string, CommunicationChannel> = {
  Telegram: "TELEGRAM",
  Email: "EMAIL",
};
