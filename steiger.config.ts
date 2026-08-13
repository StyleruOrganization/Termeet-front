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
    },
  },
  {
    // Форма фидбека специально вынесена в widgets, хотя пока стоит только на лендинге.
    files: ["./src/widgets/FeedbackForm/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
