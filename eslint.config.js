import pluginVue from "eslint-plugin-vue";
import tseslint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vueParser from "vue-eslint-parser";


const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    plugins: {
      "unused-imports": unusedImports,
    },
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/block-order": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "vue/multi-word-component-names": "off",
      "vue/no-reserved-component-names": "off",
    },
  },
]);
