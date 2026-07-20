import { fileURLToPath, URL } from "node:url";
import { mergeConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig((configEnv) =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        environment: "jsdom",
        root: fileURLToPath(new URL("./", import.meta.url)),
        // Node 25+ enables a native Web Storage API that shadows jsdom's
        // localStorage/sessionStorage with a stub. Disable it so tests get
        // jsdom's real implementation. See vitest-dev/vitest#8757.
        execArgv: ["--no-webstorage"],
      },
    }),
  ),
);
