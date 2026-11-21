import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/shared/i18n";
import { useInView } from "@/shared/libs";
import TermeetLogo from "@assets/icons/logo.svg";
import TelegramIcon from "@assets/icons/tg-outline.svg";
import styles from "./BotPreview.module.css";

const TYPING_START_DELAY = 250;
const CHARACTER_DELAY = 80;

export const BotPreview = () => {
  const { t } = useTranslation();
  const previewRef = useRef<HTMLDivElement>(null);
  const { hasBeenSeen } = useInView(previewRef, 0.25);
  const [typingProgress, setTypingProgress] = useState({ text: "", count: 0 });
  const commandParts = [
    { text: ` ${t("entry.botTomorrow")} `, accent: false },
    { text: `@${t("entry.botTeam")}`, accent: true },
  ];
  const characters = commandParts.flatMap(({ text, accent }) =>
    Array.from(text, character => ({ character, accent })),
  );
  const commandText = commandParts.map(({ text }) => text).join("");
  const characterCount = characters.length;
  const visibleCharacterCount = typingProgress.text === commandText ? typingProgress.count : 0;
  const isReplyReady = hasBeenSeen && visibleCharacterCount === characterCount;

  useEffect(() => {
    if (!hasBeenSeen) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const startTime = performance.now() + TYPING_START_DELAY;
    let timeoutId: number | undefined;

    const showNextCharacters = () => {
      const elapsed = Math.max(0, performance.now() - startTime);
      const count = Math.min(characterCount, Math.floor(elapsed / CHARACTER_DELAY) + 1);
      setTypingProgress({ text: commandText, count });

      if (count < characterCount) {
        timeoutId = window.setTimeout(showNextCharacters, CHARACTER_DELAY);
      }
    };

    const finishForReducedMotion = () => {
      if (reducedMotion.matches) {
        window.clearTimeout(timeoutId);
        setTypingProgress({ text: commandText, count: characterCount });
      }
    };

    if (reducedMotion.matches) {
      finishForReducedMotion();
    } else {
      setTypingProgress({ text: commandText, count: 0 });
      timeoutId = window.setTimeout(showNextCharacters, TYPING_START_DELAY);
    }

    reducedMotion.addEventListener("change", finishForReducedMotion);

    return () => {
      window.clearTimeout(timeoutId);
      reducedMotion.removeEventListener("change", finishForReducedMotion);
    };
  }, [hasBeenSeen, commandText, characterCount]);

  return (
    <div
      ref={previewRef}
      className={styles.BotPreview}
      data-animate={hasBeenSeen}
      data-reply-ready={isReplyReady}
      aria-hidden='true'
    >
      <div className={styles.BotPreview__Header}>
        <span className={styles.BotPreview__Telegram}>
          <TelegramIcon />
        </span>
        <span>{t("entry.botChat")}</span>
        <span className={styles.BotPreview__HeaderNote}>Telegram</span>
      </div>

      <div className={styles.BotPreview__Conversation} key={commandText}>
        <div className={styles.BotPreview__Command}>
          <span className={styles.BotPreview__CommandName}>/daily</span>
          {characters.map(({ character, accent }, index) => (
            <span
              key={index}
              className={styles.BotPreview__Character}
              data-accent={accent}
              data-visible={index < visibleCharacterCount}
            >
              {character}
            </span>
          ))}
        </div>

        <div className={styles.BotPreview__Reply}>
          <span className={styles.BotPreview__Avatar}>
            <TermeetLogo />
          </span>
          <div className={styles.BotPreview__Response}>
            <div className={styles.BotPreview__Bubble}>
              <div className={styles.BotPreview__Name}>Termeet</div>
              <div className={styles.BotPreview__Success}>
                <span>✅</span> {t("entry.botCreated")}!
              </div>

              <div className={styles.BotPreview__Meeting}>
                <div className={styles.BotPreview__Detail}>
                  <span className={styles.BotPreview__Emoji}>📅</span>
                  <span>{t("entry.botMeeting")}</span>
                </div>
                <div className={styles.BotPreview__Detail}>
                  <span className={styles.BotPreview__Emoji}>📆</span>
                  <span>{t("entry.botTomorrow")} · 10:00–19:00</span>
                </div>
                <div className={styles.BotPreview__Detail}>
                  <span className={styles.BotPreview__Emoji}>⏱</span>
                  <span>{t("entry.hour")} · {t("entry.botParticipants")}</span>
                </div>
              </div>

              <div className={styles.BotPreview__Time}>13:21</div>
            </div>

            <div className={styles.BotPreview__OpenMeeting}>
              {t("entry.botOpenMeeting")}
              <svg viewBox='0 0 16 16' fill='none' stroke='currentColor' strokeWidth='1.75'>
                <path d='M4 12 12 4M5 4h7v7' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
