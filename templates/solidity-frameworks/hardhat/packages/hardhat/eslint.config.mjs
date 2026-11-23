import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default defineConfig([
  globalIgnores([
    "**/artifacts",
    "**/cache",
    "**/contracts",
    "**/node_modules/",
    "**/typechain-types",
    "**/types",
    "**/generated",
    "**/*.json",
  ]),
  tseslint.configs.recommended,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },

    rules: {
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "off",

      "prettier/prettier": [
        "warn",
        {
          endOfLine: "auto",
        },
      ],
    },
  },
]);
