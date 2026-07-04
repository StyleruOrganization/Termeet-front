import type { OnboardingProps } from "@shared/ui";

export const ONBOARDING_ITEMS_IDS = {
  ADD_TIME: "ADD_TIME",
  SLOTS: "SLOTS",
  SAVE: "SAVE",
  NAME: "NAME",
} as const;

export const ONBOARDING_TEXTS: OnboardingProps["items"] = [
  { text: "Нажми «Добавить время»", id: ONBOARDING_ITEMS_IDS.ADD_TIME },
  { text: "Выдели удобные слоты", subtitle: "Зажми и протяни, или нажми на слот", id: ONBOARDING_ITEMS_IDS.SLOTS },
  { text: "Нажми «Сохранить»", id: ONBOARDING_ITEMS_IDS.SAVE },
  { text: "Укажи имя", id: ONBOARDING_ITEMS_IDS.NAME },
];
