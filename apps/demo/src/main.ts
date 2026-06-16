/**
 * App entry point — wires up DI, router, stores and PrimeVue.
 */
import "./assets/main.css";
import "primeicons/primeicons.css";

import { createApp, type App as VueApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import Tooltip from "primevue/tooltip";
import Aura from '@primeuix/themes/aura';

import {
  createNavigationGuards,
  createPublicRoutes,
  buildPluginRoutes,
  configurePlugins,
  AUTH_SERVICE_KEY,
  APP_CONFIG_KEY,
  AuthorizedLayout,
  ChangePasswordView,
  NoAccessView,
} from "@eappflow/ui-shell";
import { createIdentityPlugin } from "@eappflow/identity";
import { createFakeAuthService } from "./services/fakeAuthService";
import { DEMO_CONFIG } from "./config/app";

import App from "./App.vue";

// ─── DI: Wire fake services ──────────────────────────────────────────────────
const authService = createFakeAuthService();

// ─── Define plugins ──────────────────────────────────────────────────────────
const identityPlugin = createIdentityPlugin({
  appName: DEMO_CONFIG.name,
});

const eAppFlowPlugins = [
  identityPlugin,
  // Additional plugins can be added here:
  // { id: "sales", name: "Sales", ... },
  // { id: "administration", name: "Administration", ... },
];

// ─── Router with component-layout pattern ────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes: buildPluginRoutes(eAppFlowPlugins, {
    layout: AuthorizedLayout,
    publicRoutes: createPublicRoutes(),
    extraRoutes: [
      {
        path: "",
        name: "dashboard",
        component: () => import("./pages/Dashboard.vue"),
      },
      {
        path: "employees",
        name: "employees",
        component: () => import("./pages/EmployeesView.vue"),
      },
      {
        path: "settings",
        name: "settings",
        component: () => import("./pages/Settings.vue"),
      },
      {
        path: "change-password",
        name: "change-password",
        component: ChangePasswordView,
      },
      {
        path: "no-access",
        name: "no-access",
        component: NoAccessView,
      },
    ],
  }),
});

// ─── Guards ──────────────────────────────────────────────────────────────────
createNavigationGuards(router, {
  loginRoute: "/login",
  forbiddenRoute: "/no-access",
});

// ─── Bootstrap ───────────────────────────────────────────────────────────────
const app: VueApp = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Provide services via DI before using any store
app.provide(AUTH_SERVICE_KEY, authService);
app.provide(APP_CONFIG_KEY, DEMO_CONFIG);

// Register plugins (collects routes, menus, permissions)
configurePlugins(eAppFlowPlugins, app, router);

app.use(router);

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

app.use(ToastService);
app.use(ConfirmationService);
app.directive("tooltip", Tooltip);

app.mount("#app");