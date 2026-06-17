// ─── Re-exports from @eappflow/ui-shell-core ─────────────────────────────────
// Types
export type {
  Permission,
  EafMenuItem,
  EafMenuModule,
  EafFilteredMenuModule,
  NavigationGuardOptions,
  ToastMessage,
  ValidationMessage,
} from "@eappflow/ui-shell-core";

// Backward-compatible aliases
/** @deprecated Use {@link EafMenuItem} instead */
export type { EafMenuItem as MenuItem } from "@eappflow/ui-shell-core";
/** @deprecated Use {@link EafMenuModule} instead */
export type { EafMenuModule as MenuModule } from "@eappflow/ui-shell-core";
/** @deprecated Use {@link EafFilteredMenuModule} instead */
export type { EafFilteredMenuModule as FilteredMenuModule } from "@eappflow/ui-shell-core";

// Stores
export { useEafNavigationStore } from "@eappflow/ui-shell-core";
/** @deprecated Use {@link useEafNavigationStore} instead */
export { useEafNavigationStore as useNavigationStore } from "@eappflow/ui-shell-core";

// Composables
export { useEafNavigation } from "@eappflow/ui-shell-core";
export type { EafNavigationContext } from "@eappflow/ui-shell-core";

// Utils
export {
  SHELL_VERSION,
  STORAGE_KEYS,
  eventBus,
  filterVisibleMenuModules,
  filterVisibleMenuItems,
  isMenuItemVisible,
  hasAnyPermission,
} from "@eappflow/ui-shell-core";

// ─── Router / Guards ────────────────────────────────────────────────────────
export { createNavigationGuards } from "./router/navigationGuards";
export { createPublicRoutes } from "./router/publicRoutes";
export { buildModuleRoutes } from "./router/buildModuleRoutes";

// ─── Module Registry ─────────────────────────────────────────────────────
export { configureModules } from "./plugins";

// ─── Stores ─────────────────────────────────────────────────────────────────
export { useAuthStore } from "./stores/useAuthStore";
export { useLayoutStore } from "./stores/useLayoutStore";

// ─── Services / DI ──────────────────────────────────────────────────────────
export type {
  AuthService,
  MenuService,
  ThemeService,
} from "./services/interfaces";

// ─── Vue Plugin ─────────────────────────────────────────────────────────────
export { EAppFlowUIShell } from "./plugin";
export type { EAppFlowUIShellPluginOptions } from "./plugin";
export {
  AUTH_SERVICE_KEY,
  MENU_SERVICE_KEY,
  THEME_SERVICE_KEY,
  APP_CONFIG_KEY,
} from "./services/interfaces";
export { createDefaultAuthService } from "./services/defaultAuthService";
export { createDefaultMenuService, createStaticMenuService } from "./services/defaultMenuService";
export { createDefaultThemeService } from "./services/defaultThemeService";

// ─── Types ──────────────────────────────────────────────────────────────────
export type {
  User,
  AuthState,
  LoginRequest,
  AuthResult,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  ThemeSettings,
  ThemeColorName,
  AppConfig,
  EafModule,
  ModuleRegistrationResult,
} from "./types";
export {
  THEME_COLORS,
} from "./types";