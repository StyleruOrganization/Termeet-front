import { useMutation } from "@tanstack/react-query";
import { apiClient, HttpError } from "@/shared/api";
import { useToastStore } from "@features/ToastContainer";

export type FeedbackType = "HELP" | "SUGGESTION" | "BUG" | "PARTNERSHIP" | "OTHER";
export type CommunicationChannel = "EMAIL" | "TELEGRAM";

export interface ISendFeedbackPayload {
  photos: File[];
  type: FeedbackType;
  communication_channel: CommunicationChannel;
  contact: string;
  message: string;
}

const buildFormData = (data: ISendFeedbackPayload): FormData => {
  const formData = new FormData();
  formData.append("type", data.type);
  formData.append("communication_channel", data.communication_channel);
  formData.append("contact", data.contact);
  formData.append("message", data.message);
  data.photos.forEach(file => formData.append("photos", file));
  return formData;
};

export const useSendFeedback = () => {
  const addToast = useToastStore(store => store.addToast);

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: (data: ISendFeedbackPayload) => apiClient.postFormData<void>("/feedback/send", buildFormData(data)),
    onSuccess: () => {
      addToast({
        id: "feedback-success",
        message: "Обратная связь отправлена",
        type: "success",
      });
    },
    onError: (error: unknown) => {
      console.error("Ошибка при отправке обратной связи:", error);
      const message =
        error instanceof HttpError && error.status === 422
          ? "Ошибка в формате данных"
          : "Ошибка при отправке обратной связи";
      addToast({
        id: "feedback-error",
        message,
        type: "error",
      });
    },
  });

  const sendFeedback = (data: ISendFeedbackPayload) => {
    mutate(data);
  };

  return { sendFeedback, isPending, isSuccess };
};
