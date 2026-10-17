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

import {
  effectScope,
  watchEffect,
  type App as VueApp,
  type Component,
  type EffectScope,
} from "vue";
import { createPinia } from "pinia";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import type {
  EafModule,
  EafAiToolConfig,
  AppConfig,
  NavigationGuardOptions,
  I18nConfig,
} from "./types";
import {
  AUTH_SERVICE_KEY,
  MENU_SERVICE_KEY,
  THEME_SERVICE_KEY,
  APP_CONFIG_KEY,
  type AuthService,
  type MenuService,
  type ThemeService,
  type MicrosoftSSOService,
  MICROSOFT_SSO_SERVICE_KEY,
  I18n_CONFIG_KEY,
} from "./services/interfaces";
import { defaultParseApiError } from "./services/defaultParseApiError";
import {
  EAF_FORM_KEY,
  useEafAiTool,
  type EafFormApiErrorParser,
} from "@eappflow/ui-shell-components";
import { filterPermitted, filterVisibleMenuModules } from "./utils/permissions";
import { navigateTool } from "./ai-tools/navigateTool";
import { createNavigationGuards } from "./router/navigationGuards";
import { createPublicRoutes } from "./router/publicRoutes";
import { buildModuleRoutes } from "./router/buildModuleRoutes";
import { configureModules } from "./plugins";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import Tooltip from "primevue/tooltip";

// ─── Layout component (imported directly to avoid circular deps) ────────────
import AuthorizedLayout from "./layouts/AuthorizedLayout.vue";
import { useAuthStore } from "./stores/useAuthStore";
import { useEafNavigationStore } from "./stores/useEafNavigationStore";
import { useLayoutStore } from "./stores/useLayoutStore";
import { createEafI18n } from "./composables/createEafI18n";

// ─── Plugin Options ─────────────────────────────────────────────────────────

export interface EAppFlowUIShellPluginOptions {
  /** eAppFlow modules to register (e.g. Identity, Sales, …) */
  modules: EafModule[];

  /** Application metadata (name, version, environment) */
  appConfig: AppConfig;

  /** Optional i18n configuration */
  i18nConfig?: I18nConfig;
  /** Optional service overrides (DI) */
  services?: {
    authService?: AuthService;
    microsoftSSOService?: MicrosoftSSOService;
    menuService?: MenuService;
    themeService?: ThemeService;
    parseApiError?: EafFormApiErrorParser;
  };

  /** The app's own AI chat tools, next to the modules' (`EafModule.aiTools`) */
  aiTools?: EafAiToolConfig[];

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
    const {
      modules,
      appConfig,
      i18nConfig,
      services,
      router: routerOptions,
    } = options;

    // ── 1. Pinia ─────────────────────────────────────────────────────────
    const pinia = createPinia();
    app.use(pinia);

    // ── 2. I18n Service ────────────────────────────────────────────────────
    const { i18n, eafI18nConfig } = createEafI18n(modules, i18nConfig);
    app.use(i18n);
    app.provide(I18n_CONFIG_KEY, eafI18nConfig);

    // ── 3. Provide DI services ───────────────────────────────────────────
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
    if (services?.microsoftSSOService) {
      app.provide(MICROSOFT_SSO_SERVICE_KEY, services.microsoftSSOService);
    }

    // useEafForm lives in ui-shell-components and can't import ui-shell's
    // default, so (unlike the services above) the fallback is resolved here
    // rather than at the injection site.
    app.provide(EAF_FORM_KEY, services?.parseApiError ?? defaultParseApiError);

    // ── 4. Build router ──────────────────────────────────────────────────
    const layout = routerOptions?.layout ?? AuthorizedLayout;
    const extraRoutes = [
      ...(routerOptions?.extraRoutes ?? []),
      // The account menu's - last and unnamed, so an app's own one wins
      {
        path: "change-password",
        component: () => import("./views/ChangePasswordView.vue"),
      },
    ];

    const router = createRouter({
      history: createWebHistory(),
      routes: buildModuleRoutes(modules, {
        layout,
        publicRoutes: createPublicRoutes(),
        extraRoutes,
        layoutPath: routerOptions?.layoutPath,
      }),
    });

    // ── 5. Navigation guards ─────────────────────────────────────────────
    createNavigationGuards(router, routerOptions?.guards);

    // ── 6. AI chat tools ─────────────────────────────────────────────────
    const aiTools = [
      ...modules.flatMap((mod) => mod.aiTools ?? []),
      ...(options.aiTools ?? []),
    ];
    // Offered next to the screens', made anew when the permissions, the menu
    // or the chat page change - so a call to one taken back meanwhile fails
    let shellTools: EffectScope | undefined;
    watchEffect(() => {
      const permissions = useAuthStore(pinia).userPermissions;
      const menu = filterVisibleMenuModules(
        useEafNavigationStore(pinia).menuModules,
        permissions,
      );
      const tools = [
        ...(useLayoutStore(pinia).chatPageOpen
          ? []
          : [navigateTool(router, menu)]),
        ...filterPermitted(aiTools, permissions),
      ];
      shellTools?.stop();
      shellTools = effectScope(true);
      shellTools.run(() => tools.forEach((tool) => useEafAiTool(tool)));
    });

    // ── 7. Register modules ──────────────────────────────────────────────
    configureModules(modules, app);

    // ── 8. Use router ────────────────────────────────────────────────────
    app.use(router);

    // ── 9. Microsoft SSO ─────────────────────────────────────────────────
    const authStore = useAuthStore();
    if (
      services?.microsoftSSOService &&
      services.microsoftSSOService?.enabled !== false
    ) {
      if (!services?.authService) {
        throw new Error(
          "[ui-shell] Microsoft SSO is enabled, but no AuthService is provided. Provide an AuthService via app.provide(AUTH_SERVICE_KEY, ...).",
        );
      }
      authStore.initializeMsalInstance(router);
    }

    // ── 10. Use Toast ────────────────────────────────────────────────────
    app.use(ToastService);

    // ── 11. Use Confirmation ────────────────────────────────────────────────────
    app.use(ConfirmationService);

    // ── 12. v-tooltip for host apps ──────────────────────────────────────────
    app.directive("tooltip", Tooltip);
  },
};
