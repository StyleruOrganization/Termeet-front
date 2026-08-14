import { useEffect, useMemo, useState } from "react";
import { useMeetStore, type IMeet } from "@/entities/Meet";
import { useSessionStore } from "@/entities/User";
import { useTranslation } from "@/shared/i18n";
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
  const { t } = useTranslation();

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
        <h2>{t("prefill.title")}</h2>
        <p>{t("prefill.body")}</p>
        <button
          type='button'
          className='baseButton mainButton'
          onClick={() => {
            closeForVisit();
            startEditingSlots(null, prefill);
          }}
        >
          {t("prefill.yes")}
        </button>
        <button
          type='button'
          className='baseButton outlineButton'
          onClick={() => {
            closeForVisit();
            startEditingSlots();
          }}
        >
          {t("prefill.no")}
        </button>
        <button
          type='button'
          className='baseButton secondaryButton'
          onClick={() => {
            closeForVisit();
            updateSettings({ suggest_prefill: false }).catch(() => undefined);
          }}
        >
          {t("prefill.never")}
        </button>
      </div>
    </ModalWrapper>
  );
};
