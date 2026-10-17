import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";

export default defineConfig((env) => ({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "EappflowUiShellComponents",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rolldownOptions: {
      external: [
        "vue",
        "vue-i18n",
        "primevue",
        "pinia",
        /^primevue\/.*/,
        // Schemas come from the host's copy
        "zod",
      ],
    },
  },
}));
