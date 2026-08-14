import { useEffect, useState } from "react";
import { useMeetStore } from "@/entities/Meet";
import { Onboarding as BaseOnboarding } from "@/shared/ui";
import { ONBOARDING_TEXTS, ONBOARDING_ITEMS_IDS } from "../../model/constants";

const ALL_STEPS = [
  ONBOARDING_ITEMS_IDS.ADD_TIME,
  ONBOARDING_ITEMS_IDS.SLOTS,
  ONBOARDING_ITEMS_IDS.SAVE,
  ONBOARDING_ITEMS_IDS.NAME,
] as const;

export const Onboarding = () => {
  const isEditingMode = useMeetStore(store => store.isEditing);
  const newSelectedSlots = useMeetStore(store => store.newSelectedSlots);
  const isModalOpen = useMeetStore(store => store.isModalOpen);
  const timeIsAdded = useMeetStore(store => store.timeIsAdded);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    if (timeIsAdded) {
      setHasFinished(true);
    }
  }, [timeIsAdded]);

  const completedItems: (keyof typeof ONBOARDING_ITEMS_IDS)[] = hasFinished
    ? [...ALL_STEPS]
    : [
        ...(isEditingMode ? [ONBOARDING_ITEMS_IDS.ADD_TIME] : []),
        ...(newSelectedSlots.size > 0 ? [ONBOARDING_ITEMS_IDS.SLOTS] : []),
        ...(isModalOpen ? [ONBOARDING_ITEMS_IDS.SAVE] : []),
        ...(timeIsAdded ? [ONBOARDING_ITEMS_IDS.NAME] : []),
      ];

  return (
    <BaseOnboarding
      items={ONBOARDING_TEXTS}
      title='Как выбрать время'
      completedItems={completedItems}
      CongratulationContent={
        <>
          Поздравляем! <br /> Вы успешно добавили время!
        </>
      }
    />
  );
};
