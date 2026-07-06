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
import Tooltip from "primevue/tooltip";
import Button from "primevue/button";
import Aura from "@primeuix/themes/aura";

import { EAppFlowUIShell } from "@eappflow/ui-shell";
import { createDiagnosticsModule } from "@eappflow/diagnostics";
import { createFakeAuthService } from "./services/fakeAuthService";
import { DEMO_CONFIG } from "./config/app";

import App from "./App.vue";
import { InputText } from "primevue";

// ─── Define modules ──────────────────────────────────────────────────────────
const diagnosticsModule = createDiagnosticsModule({
  registerInMenu: true,
});

const eAppFlowModules = [diagnosticsModule];

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const app: VueApp = createApp(App);

// PrimeVue with Aura theme
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: "none",
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
  services: {
    authService: createFakeAuthService(),
  },
  router: {
    extraRoutes: [
      {
        path: "",
        name: "dashboard",
        component: () => import("./pages/Dashboard.vue"),
      },
    ],
  },
});

// eslint-disable-next-line vue/multi-word-component-names, vue/no-reserved-component-names
app.component("Button", Button);
app.component("InputText", InputText);

app.use(ToastService);
app.use(ConfirmationService);
app.directive("tooltip", Tooltip);

app.mount("#app");
