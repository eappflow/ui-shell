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
    rollupOptions: {
      external: [
        "vue",
        "vue-router",
        "pinia",
        "primevue",

        "@eappflow/ui-shell-components",
      ],
      output: {
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
          pinia: "Pinia",
          primevue: "PrimeVue",
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      css: {
        // Ensure Tailwind CSS is processed correctly
      },
    },
  },
  // Build CSS separately for the style export
  rollupOptions: {
    input: {
      style: resolve(__dirname, "src/style/index.css"),
    },
    output: {
      entryFileNames: `[name].css`,
      chunkFileNames: `[name].css`,
      assetFileNames: `[name].[ext]`,
    },
  },
});
