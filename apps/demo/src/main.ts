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
  AUTH_SERVICE_KEY,
  MENU_SERVICE_KEY,
  useNavigationStore,
  ChangePasswordView,
  NoAccessView,
} from "@eappflow/ui-shell";
import { createFakeAuthService } from "./services/fakeAuthService";
import { createFakeMenuService } from "./services/fakeMenuService";
import { DEMO_CONFIG } from "./config/app";

import App from "./App.vue";

// ─── DI: Wire fake services ──────────────────────────────────────────────────
const authService = createFakeAuthService();
const menuService = createFakeMenuService();

// ─── Router ──────────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Public routes (no auth) — delivered by ui-shell
    ...createPublicRoutes(),
    // Protected routes
    {
      path: "/",
      component: () => import("./pages/Dashboard.vue"),
      name: "dashboard",
    },
    {
      path: "/employees",
      name: "employees",
      component: () => import("./pages/EmployeesView.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("./pages/Settings.vue"),
    },
    {
      path: "/change-password",
      name: "change-password",
      component: ChangePasswordView,
    },
    {
      path: "/no-access",
      name: "no-access",
      component: NoAccessView,
    },
  ],
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
app.provide(MENU_SERVICE_KEY, menuService);

// Initialize menu from fake service
const navStore = useNavigationStore();
navStore.setMenuModules(menuService.getMenu());

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