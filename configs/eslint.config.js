import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/public/**"],
  },
  ...pluginVue.configs["flat/recommended"],
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/component-tags-order": [
        "warn",
        { order: ["script", "template", "style"] },
      ],
    },
  },
]);