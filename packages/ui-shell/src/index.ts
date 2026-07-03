// ─── Styles ─────────────────────────────────────────────────────────────────
import "./style/index.css";

// Types
export type {
  Permission,
  EafMenuItem,
  EafMenuModule,
  EafFilteredMenuModule,
  NavigationGuardOptions,
  ToastMessage,
  ValidationMessage,
} from "./types";

// Utils
export {
  SHELL_VERSION,
  STORAGE_KEYS,
  eventBus,
  filterVisibleMenuModules,
  filterVisibleMenuItems,
  isMenuItemVisible,
  hasAnyPermission,
} from "./utils";

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
export {
  createDefaultMenuService,
  createStaticMenuService,
} from "./services/defaultMenuService";
export { createDefaultThemeService } from "./services/defaultThemeService";

// ─── Composables ───────────────────────────────────────────────────────────
export { useEafAuth as useAuth } from "./composables/useEafAuth";
export { useEafNavigation } from "./composables/useEafNavigation";
export { useEafLayout as useLayout } from "./composables/useEafLayout";

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
  EafClasses,
  EafModule,
  ModuleRegistrationResult,
} from "./types";
export { THEME_COLORS } from "./types";
