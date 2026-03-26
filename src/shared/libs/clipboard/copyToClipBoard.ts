// Source - https://stackoverflow.com/a/30810322

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info" | "wait";
  isExiting?: boolean;
  duration?: number;
}
function fallbackCopyTextToClipboard(text: string, addToast: (toast: Toast) => void) {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    addToast({
      message: successful ? "Ссылка скопирована" : "Не удалось скопировать ссылку",
      type: successful ? "success" : "error",
      id: `copy-to-clipboard-${Date.now()}`,
    });
  } catch {
    addToast({
      message: "Не удалось скопировать ссылку",
      type: "error",
      id: `copy-to-clipboard-${Date.now()}`,
    });
  }

  document.body.removeChild(textArea);
}
export function copyTextToClipboard(text: string, addToast: (toast: Toast) => void) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text, addToast);
    return;
  }
  navigator.clipboard.writeText(text).then(
    () => {
      addToast({
        message: "Ссылка скопирована",
        type: "success",
        id: `copy-to-clipboard-${Date.now()}`,
      });
    },
    () => {
      addToast({
        message: "Не удалось скопировать ссылку",
        type: "error",
        id: `copy-to-clipboard-${Date.now()}`,
      });
    },
  );
}
