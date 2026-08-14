import { useEffect, useRef, useState } from "react";
import { useMeetStore } from "@/entities/Meet";
import { useShowOnboarding } from "@/entities/User";
import { Onboarding as BaseOnboarding } from "@/shared/ui";
import { ONBOARDING_TEXTS, ONBOARDING_ITEMS_IDS } from "../../model/constants";

const ALL_STEPS = [
  ONBOARDING_ITEMS_IDS.ADD_TIME,
  ONBOARDING_ITEMS_IDS.SLOTS,
  ONBOARDING_ITEMS_IDS.SAVE,
  ONBOARDING_ITEMS_IDS.NAME,
] as const;

const snapshotSlots = (slots: Map<string, string[]>) =>
  [...slots.entries()]
    .map(([date, times]) => `${date}:${[...times].sort().join(",")}`)
    .sort()
    .join("|");

export const Onboarding = () => {
  const { enabled, hide } = useShowOnboarding();
  const isEditingMode = useMeetStore(store => store.isEditing);
  const isFinalizing = useMeetStore(store => store.isFinalizing);
  const newSelectedSlots = useMeetStore(store => store.newSelectedSlots);
  const isModalOpen = useMeetStore(store => store.isModalOpen);
  const timeIsAdded = useMeetStore(store => store.timeIsAdded);
  const slotsOnEditStart = useRef<string | null>(null);
  const wasEditing = useRef(false);
  const [slotsChanged, setSlotsChanged] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);

  useEffect(() => {
    if (isFinalizing) {
      wasEditing.current = isEditingMode;
      return;
    }
    if (isEditingMode && !wasEditing.current) {
      slotsOnEditStart.current = snapshotSlots(newSelectedSlots);
      setSlotsChanged(false);
    }
    if (!isEditingMode && wasEditing.current) {
      slotsOnEditStart.current = null;
      setSlotsChanged(false);
    }
    wasEditing.current = isEditingMode;
  }, [isEditingMode, isFinalizing, newSelectedSlots]);

  useEffect(() => {
    if (!isEditingMode || isFinalizing || slotsOnEditStart.current === null) {
      return;
    }
    if (snapshotSlots(newSelectedSlots) !== slotsOnEditStart.current) {
      setSlotsChanged(true);
    }
  }, [isEditingMode, isFinalizing, newSelectedSlots]);

  useEffect(() => {
    if (timeIsAdded) {
      setHasFinished(true);
    }
  }, [timeIsAdded]);

  if (!enabled || isFinalizing) {
    return null;
  }

  let farthest = 0;
  if (isEditingMode) {
    farthest = 1;
  }
  if (slotsChanged) {
    farthest = 2;
  }
  if (isEditingMode && (isModalOpen || timeIsAdded)) {
    farthest = Math.max(farthest, 2);
    farthest = 3;
  }
  if (timeIsAdded || hasFinished) {
    farthest = 4;
  }

  const completedItems = ALL_STEPS.slice(0, farthest);

  return (
    <BaseOnboarding
      items={ONBOARDING_TEXTS}
      title='Как выбрать время'
      completedItems={completedItems}
      onHide={hide}
      CongratulationContent={
        <>
          Поздравляем! <br /> Вы успешно добавили время!
        </>
      }
    />
  );
};
