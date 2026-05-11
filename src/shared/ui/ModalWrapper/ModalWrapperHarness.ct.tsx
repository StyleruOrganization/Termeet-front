import { useState } from "react";
import { ModalWrapper } from "./ModalWrapper";

export function ModalWrapperHarnessCt({
  initialOpen = true,
  isAnimate = true,
  animationDuration = 300,
  contentVariant = "short",
}: {
  initialOpen?: boolean;
  isAnimate?: boolean;
  animationDuration?: number;
  contentVariant?: "short" | "long";
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <div style={{ padding: 16 }}>
      <button onClick={() => setIsOpen(true)}>Open modal</button>
      <ModalWrapper
        isOpen={isOpen}
        isAnimate={isAnimate}
        animationDuration={animationDuration}
        onClose={() => setIsOpen(false)}
        scrollbarWidth={16}
      >
        <div style={{ maxWidth: 520 }}>
          <h2 style={{ margin: "0 0 12px" }}>Заголовок модалки</h2>
          {contentVariant === "short" ? (
            <p style={{ margin: 0 }}>Короткий контент для визуального теста.</p>
          ) : (
            <div>
              {Array.from({ length: 25 }).map((_, i) => (
                <p key={i} style={{ margin: "0 0 12px" }}>
                  Длинный контент строки {i + 1} — проверяем скролл и отступы.
                </p>
              ))}
            </div>
          )}
        </div>
      </ModalWrapper>
    </div>
  );
}
