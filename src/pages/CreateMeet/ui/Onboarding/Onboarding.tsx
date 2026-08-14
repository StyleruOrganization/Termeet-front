import { useEffect, useState } from "react";
import { useShowOnboarding } from "@/entities/User";
import { Onboarding as BaseOnboarding } from "@/shared/ui";
import { useCreateMeetStore } from "../../model";
import { ONBOARDING_TEXTS, ONBOARDING_ITEMS_IDS } from "../../model/constants";

export const Onboarding = () => {
  const { enabled, hide } = useShowOnboarding();
  const meetTitle = useCreateMeetStore(state => state.values.title);
  const choosenDates = useCreateMeetStore(state => state.values.dates);
  const [completedItems, setCompletedItems] = useState<(keyof typeof ONBOARDING_ITEMS_IDS)[]>([]);

  useEffect(() => {
    const next: (keyof typeof ONBOARDING_ITEMS_IDS)[] = [];
    if (choosenDates.length > 0) {
      next.push(ONBOARDING_ITEMS_IDS.DATES);
    }
    if (meetTitle != "") {
      next.push(ONBOARDING_ITEMS_IDS.NAME);
    }
    setCompletedItems(next);
  }, [meetTitle, choosenDates]);

  if (!enabled) {
    return null;
  }

  return (
    <BaseOnboarding
      items={ONBOARDING_TEXTS}
      title='Как создать встречу'
      completedItems={completedItems}
      onHide={hide}
      CongratulationContent={
        <>
          Поздравляем! <br />
          Нажмите «Создать встречу»
        </>
      }
    />
  );
};
