import { useEffect, useState } from "react";
import { useMeetStore } from "@/entities/Meet";
import { Onboarding as BaseOnboarding } from "@/shared/ui";
import { ONBOARDING_TEXTS, ONBOARDING_ITEMS_IDS } from "../../model/constants";

export const Onboarding = () => {
  const isEditingMode = useMeetStore(store => store.isEditing),
    newSelectedSlots = useMeetStore(store => store.newSelectedSlots),
    isModalOpen = useMeetStore(store => store.isModalOpen),
    timeIsAdded = useMeetStore(store => store.timeIsAdded);
  const [completedItems, setCompletedItems] = useState<(keyof typeof ONBOARDING_ITEMS_IDS)[]>([]);

  useEffect(() => {
    console.log("IN USE EFFECT", {
      timeIsAdded,
      "completedItems.length == ONBOARDING_TEXTS.length": completedItems.length == ONBOARDING_TEXTS.length - 1,
    });
    if (completedItems.length == ONBOARDING_TEXTS.length) return;
    if (timeIsAdded && completedItems.length == ONBOARDING_TEXTS.length - 1) {
      setCompletedItems(prev => [...prev, ONBOARDING_ITEMS_IDS.NAME]);
      return;
    }
    let newCompletedItems: typeof completedItems = [];
    if (isEditingMode) {
      newCompletedItems.push(ONBOARDING_ITEMS_IDS.ADD_TIME);
    } else {
      newCompletedItems = newCompletedItems.filter(item => item != ONBOARDING_ITEMS_IDS.ADD_TIME);
    }

    if (newSelectedSlots.size > 0) {
      newCompletedItems.push(ONBOARDING_ITEMS_IDS.SLOTS);
    } else {
      newCompletedItems = newCompletedItems.filter(item => item != ONBOARDING_ITEMS_IDS.SLOTS);
    }

    if (isModalOpen) {
      newCompletedItems.push(ONBOARDING_ITEMS_IDS.SAVE);
    } else {
      newCompletedItems = newCompletedItems.filter(item => item != ONBOARDING_ITEMS_IDS.SAVE);
    }

    if (timeIsAdded) {
      newCompletedItems.push(ONBOARDING_ITEMS_IDS.NAME);
    } else {
      newCompletedItems = newCompletedItems.filter(item => item != ONBOARDING_ITEMS_IDS.NAME);
    }

    console.log("newCompletedItems", newCompletedItems, {
      isEditingMode,
      newSelectedSlots,
      isModalOpen,
      timeIsAdded,
    });

    setCompletedItems([...newCompletedItems]);
  }, [isEditingMode, newSelectedSlots, isModalOpen, timeIsAdded]);

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
