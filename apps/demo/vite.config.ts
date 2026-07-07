import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
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
