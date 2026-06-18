import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    cssCodeSplit: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        style: resolve(__dirname, "src/style/index.css"),
      },
      name: "EappflowDiagnostics",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "js" : "cjs"}`,
    },
    rollupOptions: {
      external: ["vue", "vue-router", "@eappflow/ui-shell"],
      output: {
        globals: {
          vue: "Vue",
          "vue-router": "VueRouter",
        },
      },
    },
  },
});
