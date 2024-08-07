// @ts-check
import { fixupPluginRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettierConfigRecommended from "eslint-plugin-prettier/recommended";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const pluginsToPatch = ["@next/next", "react-hooks"];

const compatConfig = [...compat.extends("next/core-web-vitals")];

const patchedConfig = compatConfig.map(entry => {
  const plugins = entry.plugins;
  for (const key in plugins) {
    if (plugins.hasOwnProperty(key) && pluginsToPatch.includes(key)) {
      plugins[key] = fixupPluginRules(plugins[key]);
    }
  }
  return entry;
});

const config = [
  ...patchedConfig,
  ...ts.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.js", "*.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "error",
    },
  },

  prettierConfigRecommended, // Last since it disables some previously set rules
  {
    ignores: [
      ".next/*",
      "out/*",
      "node_modules/*",
      "**/*.less",
      "**/*.css",
      "**/*.scss",
      "**/*.json",
      "**/*.png",
      "**/*.svg",
      "**/generated/**/*",
    ],
  },
];

export default config;
