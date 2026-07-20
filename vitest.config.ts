import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/ui-shell", "packages/ui-shell-components"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["packages/*/src/**/*.ts"],
      exclude: ["**/*.d.ts", "**/__tests__/**", "**/types/**"],
      reporter: ["text", "html", "lcov"],
    },
  },
});
