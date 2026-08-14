import { useEffect, useMemo, useState } from "react";
import { useMeetStore, type IMeet } from "@/entities/Meet";
import { formatAvailabilitySummary, useSessionStore } from "@/entities/User";
import { ModalWrapper } from "@/shared/ui";
import styles from "./MeetPrefillModal.module.css";
import { buildPrefillFromTemplate } from "../../lib/prefill/buildPrefillFromTemplate";

const skipKey = (hash: string) => `termeet-prefill-skip:${hash}`;

type MeetPrefillModalProps = {
  hash: string;
  canVote: boolean;
  mySlotName: string | null;
  timeInfo: IMeet["timeInfo"];
};

export const MeetPrefillModal = ({ hash, canVote, mySlotName, timeInfo }: MeetPrefillModalProps) => {
  const user = useSessionStore(state => state.user);
  const updateSettings = useSessionStore(state => state.updateSettings);
  const isEditing = useMeetStore(state => state.isEditing);
  const startEditingSlots = useMeetStore(state => state.startEditingSlots);
  const [isOpen, setIsOpen] = useState(false);

  const template = user?.availability_template;
  const prefill = useMemo(() => buildPrefillFromTemplate(timeInfo, template ?? []), [timeInfo, template]);

  useEffect(() => {
    if (!user || !canVote || mySlotName || isEditing) {
      return;
    }
    if (user.suggest_prefill === false) {
      return;
    }
    if (!prefill.size) {
      return;
    }
    if (sessionStorage.getItem(skipKey(hash))) {
      return;
    }
    setIsOpen(true);
  }, [user, canVote, mySlotName, isEditing, prefill, hash]);

  const closeForVisit = () => {
    sessionStorage.setItem(skipKey(hash), "1");
    setIsOpen(false);
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={closeForVisit} isAnimate>
      <div className={styles.MeetPrefillModal}>
        <h2>Подставить ваше обычное время?</h2>
        <p>
          В кабинете сохранён шаблон: {formatAvailabilitySummary(template ?? []) || "обычное время"}. Можно сразу
          отметить его на этой встрече и поправить ячейки. Если не нужно — выберите время сами, сетка откроется пустой.
        </p>
        <button
          type='button'
          className='baseButton mainButton'
          onClick={() => {
            closeForVisit();
            startEditingSlots(null, prefill);
          }}
        >
          Да, подставить
        </button>
        <button
          type='button'
          className='baseButton outlineButton'
          onClick={() => {
            closeForVisit();
            startEditingSlots();
          }}
        >
          Нет, заполню сам
        </button>
        <button
          type='button'
          className='baseButton secondaryButton'
          onClick={() => {
            closeForVisit();
            updateSettings({ suggest_prefill: false }).catch(() => undefined);
          }}
        >
          Больше не предлагать
        </button>
      </div>
    </ModalWrapper>
  );
};
