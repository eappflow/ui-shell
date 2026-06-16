import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@eappflow/ui-shell": resolve(__dirname, "../../packages/ui-shell/src"),
      "@eappflow/ui-shell-components": resolve(
        __dirname,
        "../../packages/ui-shell-components/src",
      ),
      "@eappflow/ui-shell-styles": resolve(
        __dirname,
        "../../packages/ui-shell-styles/src",
      ),
      "@eappflow/identity": resolve(
        __dirname,
        "../../modules/identity/src",
      ),
    },
  },
});