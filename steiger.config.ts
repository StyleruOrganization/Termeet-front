import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    files: ["./src/**"],
    rules: {
      "fsd/segments-by-purpose": "off",
      "fsd/no-segmentless-slices": "off",
      "fsd/repetitive-naming": "off",
      // shared/i18n держит словарь в lib и локаль в model — это не FSD-сегменты.
      "fsd/no-reserved-folder-names": "off",
    },
  },
  {
    // Форма фидбека специально вынесена в widgets, хотя пока стоит только на лендинге.
    files: ["./src/widgets/FeedbackForm/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
  {
    // Команды нужны и на /teams, и при создании встречи. Steiger не видит
    // pages/Teams/Teams.tsx — файл в корне слайса, не в ui/api/model.
    files: ["./src/entities/Team/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
