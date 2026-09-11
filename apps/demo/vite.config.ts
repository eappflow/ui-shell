import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 5173,
  },
  resolve: {
    // Workspace packages must share the app's theme registry and Vue runtime.
    dedupe: ["vue", "primevue", "@primevue/core", "@primeuix/styled"],
    alias: {
      "@eappflow/ui-shell-components": resolve(
        __dirname,
        "../../packages/ui-shell-components/src",
      ),
      "@eappflow/diagnostics": resolve(
        __dirname,
        "../../modules/diagnostics/src",
      ),
      "@eappflow/ui-shell": resolve(__dirname, "../../packages/ui-shell/src"),
    },
  },
});
