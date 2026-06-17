// ─── Types ──────────────────────────────────────────────────────────────────
export type {
  Permission,
  EafMenuItem,
  EafMenuModule,
  EafFilteredMenuModule,
  NavigationGuardOptions,
  ToastMessage,
  ValidationMessage,
  AppConfig,
} from "./types";

// ─── Services / DI (interfaces + keys) ──────────────────────────────────────
export type {
  AuthService,
  MenuService,
  ThemeService,
} from "./services/interfaces";

export {
  AUTH_SERVICE_KEY,
  MENU_SERVICE_KEY,
  THEME_SERVICE_KEY,
  APP_CONFIG_KEY,
} from "./services/interfaces";

// ─── Stores ─────────────────────────────────────────────────────────────────
export { useEafNavigationStore } from "./stores/useEafNavigationStore";

// ─── Composables ────────────────────────────────────────────────────────────
export { useEafNavigation } from "./composables/useEafNavigation";
export type { EafNavigationContext } from "./composables/useEafNavigation";
export { EAF_NAVIGATION_KEY } from "./composables/useEafNavigation";

// ─── Utils ──────────────────────────────────────────────────────────────────
export { SHELL_VERSION, STORAGE_KEYS } from "./utils/constants";
export { eventBus } from "./utils/eventBus";
export {
  filterVisibleMenuModules,
  filterVisibleMenuItems,
  isMenuItemVisible,
  hasAnyPermission,
} from "./utils/permissions";