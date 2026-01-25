import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    // Global ignores for linting - Default: ["**/node_modules/", ".git/"].
    name: "Ignore files and directories",
    ignores: ["dist/", "eslint.config.js", ".husky/", "./infra/**", "playwright/"], // Build Directory and config files
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
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
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./configs/tsconfig.app.json",
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
    },
  },
  {
    // disable type-aware linting on JS files
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
  },
  eslintConfigPrettier,
];
