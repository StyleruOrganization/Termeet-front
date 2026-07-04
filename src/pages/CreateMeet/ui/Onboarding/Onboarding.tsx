import { useEffect, useState } from "react";
import { Onboarding as BaseOnboarding } from "@/shared/ui";
import { useCreateMeetStore } from "../../model";
import { ONBOARDING_TEXTS, ONBOARDING_ITEMS_IDS } from "../../model/constants";

export const Onboarding = () => {
  const meetTitle = useCreateMeetStore(store => store.values.title);
  const choosenDates = useCreateMeetStore(store => store.values.dates);
  const [completedItems, setCompletedItems] = useState<(keyof typeof ONBOARDING_ITEMS_IDS)[]>([]);

  useEffect(() => {
    let newCompletedItems: typeof completedItems = [];
    console.log("MEET TITLE", meetTitle);
    if (meetTitle != "") {
      newCompletedItems.push(ONBOARDING_ITEMS_IDS.NAME);
    } else {
      newCompletedItems = newCompletedItems.filter(item => item != ONBOARDING_ITEMS_IDS.NAME);
    }

    if (choosenDates.length > 0) {
      newCompletedItems.push(ONBOARDING_ITEMS_IDS.DATES);
    } else {
      newCompletedItems = newCompletedItems.filter(item => item != ONBOARDING_ITEMS_IDS.DATES);
    }

    setCompletedItems([...newCompletedItems]);
  }, [meetTitle, choosenDates]);

  return (
    <BaseOnboarding
      items={ONBOARDING_TEXTS}
      title='Как создать встречу'
      completedItems={completedItems}
      CongratulationContent={
        <>
          Поздравляем! <br />
          Нажмите «Создать встречу»
        </>
      }
    />
  );
};
