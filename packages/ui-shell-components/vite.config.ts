import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "EappflowUiShellComponents",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["vue", "primevue", "@eappflow/ui-shell-styles"],
      output: {
        globals: {
          vue: "Vue",
          primevue: "PrimeVue",
        },
      },
    },
  },
});