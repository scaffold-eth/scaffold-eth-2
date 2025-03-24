import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  globalIgnores(["**/artifacts", "**/cache", "**/contracts", "**/node_modules/", "**/typechain-types", "**/*.json"]),
  {
    extends: compat.extends("plugin:prettier/recommended", "plugin:@typescript-eslint/recommended"),

    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
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
