// ─── Layout Components ──────────────────────────────────────────────────────
export { default as AppLayout } from "./components/AppLayout.vue";
export { default as AppSidebar } from "./components/AppSidebar.vue";
export { default as AppHeader } from "./components/AppHeader.vue";
export { default as AppFooter } from "./components/AppFooter.vue";
export { default as AppMainMenu } from "./components/AppMainMenu.vue";

// ─── Layouts (route-level layout wrappers) ──────────────────────────────────
export { default as AuthorizedLayout } from "./layouts/AuthorizedLayout.vue";
export { default as UnauthorizedLayout } from "./layouts/UnauthorizedLayout.vue";

// ─── Form Components ────────────────────────────────────────────────────────
export { default as FormItem } from "./components/FormItem.vue";
export { default as FormValidationSummary } from "./components/FormValidationSummary.vue";
export { default as ActionValidationMessage } from "./components/ActionValidationMessage.vue";

// ─── Auth Views ─────────────────────────────────────────────────────────────
export { default as LoginView } from "./views/LoginView.vue";
export { default as RestorePasswordView } from "./views/RestorePasswordView.vue";
export { default as RecoverPasswordView } from "./views/RecoverPasswordView.vue";
export { default as ChangePasswordView } from "./views/ChangePasswordView.vue";
export { default as NoAccessView } from "./views/NoAccessView.vue";

// ─── Composables ────────────────────────────────────────────────────────────
export { useAuth } from "./composables/useAuth";
export { useNavigation } from "./composables/useNavigation";
export { useLayout } from "./composables/useLayout";
export { useFormValidation } from "./composables/useFormValidation";
export { useActionValidation } from "./composables/useActionValidation";

// ─── Router / Guards ────────────────────────────────────────────────────────
export { createNavigationGuards } from "./router/navigationGuards";
export { createPublicRoutes } from "./router/publicRoutes";
export { buildPluginRoutes } from "./router/buildPluginRoutes";

// ─── Plugins / Registry ─────────────────────────────────────────────────────
export { configurePlugins } from "./plugins";

// ─── Stores ─────────────────────────────────────────────────────────────────
export { useAuthStore } from "./stores/useAuthStore";
export { useNavigationStore } from "./stores/useNavigationStore";
export { useLayoutStore } from "./stores/useLayoutStore";
export { useMessageStore } from "./stores/useMessageStore";

// ─── Services / DI ──────────────────────────────────────────────────────────
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
export { createDefaultAuthService } from "./services/defaultAuthService";
export { createDefaultMenuService, createStaticMenuService } from "./services/defaultMenuService";
export { createDefaultThemeService } from "./services/defaultThemeService";

// ─── Types ──────────────────────────────────────────────────────────────────
export type {
  User,
  AuthState,
  Permission,
  LoginRequest,
  AuthResult,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  MenuItem,
  MenuModule,
  FilteredMenuModule,
  NavigationGuardOptions,
  ThemeSettings,
  ThemeColorName,
  ApiErrorResponse,
  FormValidation,
  ValidationConfig,
  ToastMessage,
  ValidationMessage,
  AppConfig,
  EafPlugin,
  PluginRegistrationResult,
} from "./types";
export {
  THEME_COLORS,
} from "./types";

// ─── Utils ──────────────────────────────────────────────────────────────────
export { SHELL_VERSION, STORAGE_KEYS } from "./utils/constants";
export {
  filterVisibleMenuModules,
  filterVisibleMenuItems,
  isMenuItemVisible,
  hasAnyPermission,
} from "./utils/permissions";