import { AppConfig } from "@eappflow/ui-shell";
import DemoLogoMark from "../components/DemoLogoMark.vue";
import DemoLogoFull from "../components/DemoLogoFull.vue";

/**
 * Demo application configuration
 */
export const DEMO_CONFIG: AppConfig = {
  name: "DemoFlow",
  version: "1.0.0",
  environment: "development",
  authorized: {
    logo: DemoLogoMark,
  },
  unauthorized: {
    logo: DemoLogoFull,
  },
  theme: {
    // Primitive palettes of the Aura preset the demo is configured with.
    // A host on a custom preset lists its own scales here instead.
    colors: ["blue", "emerald", "violet", "amber", "rose"],
    defaultColor: "blue",
  },
} as const;
