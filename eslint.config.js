import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import fsdPlugin from "eslint-plugin-fsd-lint";
import pluginQuery from "@tanstack/eslint-plugin-query";

export default [
  {
    // Global ignores for linting - Default: ["**/node_modules/", ".git/"].
    name: "Ignore files and directories",
    ignores: ["dist/", "eslint.config.js", ".husky/", "./infra/**", "playwright/", ".vercel/**"], // Build Directory and config files
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginQuery.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      parserOptions: {
        projectService: true,
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "import": importPlugin,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "fsd": fsdPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx", ".css"],
        },
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      ...pluginQuery.configs.recommended.rules,
      "@typescript-eslint/ban-ts-comment": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "no-multiple-empty-lines": ["error", { max: 1 }],
      "import/order": [
        "error",
        {
          "groups": ["builtin", "external", "internal", ["parent", "sibling", "index"], "object", "type"],
          "newlines-between": "never",
          "alphabetize": {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/no-cycle": "error",
      // Enforces FSD layer import rules (e.g., features cannot import pages)
      "fsd/forbidden-imports": "error",

      // Disallows relative imports between slices/layers, use aliases (@)
      // Allows relative imports within the same slice by default (configurable)
      "fsd/no-relative-imports": "error",

      // Enforces importing only via public API (index files)
      "fsd/no-public-api-sidestep": "error",

      // Prevents direct imports between slices in the same layer
      "fsd/no-cross-slice-dependency": "error",

      // Prevents UI imports in business logic layers (e.g., entities)
      "fsd/no-ui-in-business-logic": "error",
      "fsd/no-global-store-imports": "off",
      "fsd/ordered-imports": "off",
    },
  },
  {
    // disable type-aware linting on JS files
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
];
