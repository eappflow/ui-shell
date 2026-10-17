/**
 * App entry point — uses the @eappflow/ui-shell Vue plugin.
 *
 * The plugin handles Pinia, router, DI services, module registration,
 * and navigation guards. The demo only needs to configure PrimeVue
 * and mount the app.
 */

import "./assets/main.css";

import { createApp, type App as VueApp } from "vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import Button from "primevue/button";
import Aura from "@primeuix/themes/aura";

import {
  AI_CHAT_SERVICE_KEY,
  EAppFlowUIShell,
  EafAiChatView,
  type EafModule,
} from "@eappflow/ui-shell";
import { createDiagnosticsModule } from "@eappflow/diagnostics";
import { createFakeAuthService } from "./services/fakeAuthService";
import { createFakeAiChatService } from "./services/fakeAiChatService";
import { parseApiError } from "./services/parseApiError";
import { DEMO_CONFIG } from "./config/app";
import en from "../locales/en.json";
import pl from "../locales/pl.json";

import App from "./App.vue";
import { InputText } from "primevue";
import { createFakeMicrosoftSSOService } from "./services/fakeMicrosoftSSOService";

// ─── Define modules ──────────────────────────────────────────────────────────
const diagnosticsModule = createDiagnosticsModule({
  registerInMenu: true,
});

// The AI chat: the layout shows it once its service is provided, plus a full-page view
const aiModule: EafModule = {
  id: "ai",
  name: "AI",
  routes: [{ path: "ai-chat", name: "ai-chat", component: EafAiChatView }],
  menuModules: [
    {
      name: "AI",
      icon: "pi pi-sparkles",
      items: [
        {
          name: "AI Chat",
          icon: "pi pi-comments",
          path: "/ai-chat",
          permissions: [],
        },
      ],
    },
  ],
  // Offered only to users with one of the permissions, as menu items are shown
  aiTools: [
    {
      name: "current_time",
      description: "The user's current date and time.",
      run: () => new Date().toLocaleString(),
      permissions: ["TechnicalAdministrator"],
    },
  ],
  install(app) {
    app.provide(AI_CHAT_SERVICE_KEY, createFakeAiChatService());
  },
};

// The start screen, first in the menu
const dashboardModule: EafModule = {
  id: "dashboard",
  name: "Dashboard",
  routes: [
    {
      path: "",
      name: "dashboard",
      component: () => import("./pages/Dashboard.vue"),
    },
  ],
  menuModules: [
    {
      name: "Demo",
      icon: "pi pi-home",
      items: [
        { name: "Dashboard", icon: "pi pi-home", path: "/", permissions: [] },
      ],
    },
  ],
};

const eAppFlowModules = [dashboardModule, diagnosticsModule, aiModule];

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const app: VueApp = createApp(App);

// PrimeVue with Aura theme
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: ".dark",
      cssLayer: false,
      prefix: "p",
    },
  },
  ripple: true,
});

// Use the eAppFlow UI Shell plugin — wires up Pinia, router, DI, modules
app.use(EAppFlowUIShell, {
  modules: eAppFlowModules,
  appConfig: DEMO_CONFIG,
  i18nConfig: {
    defaultLanguage: "pl",
    supportedLanguages: [
      { localeCode: "pl", displayName: "Polski" },
      { localeCode: "en", displayName: "English" },
    ],
    messages: {
      pl: pl,
      en: en,
    },
  },
  services: {
    authService: createFakeAuthService(),
    microsoftSSOService: createFakeMicrosoftSSOService(),
    parseApiError,
  },
});

// eslint-disable-next-line vue/multi-word-component-names, vue/no-reserved-component-names
app.component("Button", Button);
app.component("InputText", InputText);

app.use(ToastService);
app.use(ConfirmationService);

app.mount("#app");
