import { defineConfig } from "vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "EappflowUiShell",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rolldownOptions: {
      external: [
        "vue",
        "vue-router",
        "pinia",
        "vue-i18n",
        "primevue",
        /^primevue\/.*/, //VERY IPORTANT: This ensures that all PrimeVue components are treated as external dependencies, preventing them from being bundled into the library and allowing users to manage their own versions of PrimeVue components. It is need to app corectly load styles for internal components
        "primeicons",
        "@eappflow/ui-shell-components",
      ],
    },
  },
});
