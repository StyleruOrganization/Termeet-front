import type { OnboardingProps } from "@shared/ui";

export const ONBOARDING_ITEMS_IDS = {
  DATES: "DATES",
  NAME: "NAME",
} as const;

export const ONBOARDING_TEXTS: OnboardingProps["items"] = [
  { text: "Выбери удобные даты", id: ONBOARDING_ITEMS_IDS.DATES },
  { text: "Укажи название встречи", id: ONBOARDING_ITEMS_IDS.NAME },
];
