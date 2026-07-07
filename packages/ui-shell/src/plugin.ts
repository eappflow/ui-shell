/**
 * eAppFlow UI Shell — Vue Plugin
 *
 * Encapsulates all bootstrap wiring (Pinia, router, DI services, module
 * registration) so host apps can simply do:
 *
 * ```ts
 * import { EAppFlowUIShell } from "@eappflow/ui-shell";
 *
 * const app = createApp(App);
 * app.use(EAppFlowUIShell, {
 *   modules: [identityModule],
 *   appConfig: { name: "MyApp", version: "1.0.0" },
 *   services: { authService: createFakeAuthService() },
 *   router: { extraRoutes: [...] },
 * });
 * app.mount("#app");
 * ```
 */

import { type App as VueApp, type Component } from "vue";
import { createPinia } from "pinia";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import type { EafModule, AppConfig, NavigationGuardOptions } from "./types";
import {
  AUTH_SERVICE_KEY,
  MENU_SERVICE_KEY,
  THEME_SERVICE_KEY,
  APP_CONFIG_KEY,
  type AuthService,
  type MenuService,
  type ThemeService,
} from "./services/interfaces";
import { createNavigationGuards } from "./router/navigationGuards";
import { createPublicRoutes } from "./router/publicRoutes";
import { buildModuleRoutes } from "./router/buildModuleRoutes";
import { configureModules } from "./plugins";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";

// ─── Layout component (imported directly to avoid circular deps) ────────────
import AuthorizedLayout from "./layouts/AuthorizedLayout.vue";

// ─── Plugin Options ─────────────────────────────────────────────────────────

export interface EAppFlowUIShellPluginOptions {
  /** eAppFlow modules to register (e.g. Identity, Sales, …) */
  modules: EafModule[];

  /** Application metadata (name, version, environment) */
  appConfig: AppConfig;

  /** Optional service overrides (DI) */
  services?: {
    authService?: AuthService;
    menuService?: MenuService;
    themeService?: ThemeService;
  };

  /** Router configuration */
  router?: {
    /** Layout component wrapping all protected routes (default: AuthorizedLayout) */
    layout?: Component | (() => Promise<Component>);
    /** Extra child routes nested under the layout (dashboard, settings, …) */
    extraRoutes?: RouteRecordRaw[];
    /** Base path for the layout route (default: "/") */
    layoutPath?: string;
    /** Navigation guard options */
    guards?: NavigationGuardOptions;
  };
}

// ─── Plugin ─────────────────────────────────────────────────────────────────

export const EAppFlowUIShell = {
  install(app: VueApp, options: EAppFlowUIShellPluginOptions): void {
    const { modules, appConfig, services, router: routerOptions } = options;

    // ── 1. Pinia ──────────────────────────────────────────────────────────
    const pinia = createPinia();
    app.use(pinia);

    // ── 2. Provide DI services ───────────────────────────────────────────
    app.provide(APP_CONFIG_KEY, appConfig);

    if (services?.authService) {
      app.provide(AUTH_SERVICE_KEY, services.authService);
    }
    if (services?.menuService) {
      app.provide(MENU_SERVICE_KEY, services.menuService);
    }
    if (services?.themeService) {
      app.provide(THEME_SERVICE_KEY, services.themeService);
    }

    // ── 3. Build router ──────────────────────────────────────────────────
    const layout = routerOptions?.layout ?? AuthorizedLayout;
    const extraRoutes = routerOptions?.extraRoutes ?? [];

    const router = createRouter({
      history: createWebHistory(),
      routes: buildModuleRoutes(modules, {
        layout,
        publicRoutes: createPublicRoutes(),
        extraRoutes,
        layoutPath: routerOptions?.layoutPath,
      }),
    });

    // ── 4. Navigation guards ─────────────────────────────────────────────
    createNavigationGuards(router, routerOptions?.guards);

    // ── 5. Register modules ──────────────────────────────────────────────
    configureModules(modules, app);

    // ── 6. Use router ────────────────────────────────────────────────────
    app.use(router);

    // ── 7. Use Toast ────────────────────────────────────────────────────
    app.use(ToastService);

    // ── 8. Use Confirmation ────────────────────────────────────────────────────
    app.use(ConfirmationService);
  },
};
