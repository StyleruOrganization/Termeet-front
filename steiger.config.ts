// ./steiger.config.js
import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // disable the `public-api` rule for files in the Shared layer
    files: ["./src/**"],
    rules: {
      "fsd/insignificant-slice": "off",
      "fsd/no-segmentless-slices": "off",
    },
  },
]);
