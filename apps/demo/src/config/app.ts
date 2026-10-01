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
    colors: ["blue", "emerald", "violet", "amber", "rose"],
  },
} as const;
