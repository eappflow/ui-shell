import type { RouteRecordRaw } from "vue-router";
import type { App } from "vue";
import type { EafClasses } from "./eaf-classes";
import type { EafLogo, EafLogoSrc } from "./eaf-logo";
import { I18nOptions } from "vue-i18n";

// ─── Route meta augmentation ─────────────────────────────────────────────────

declare module "vue-router" {
  interface RouteMeta {
    /** Module that contributed this route (set automatically on registration) */
    moduleId?: string;
    /** Whether the route is public (no auth required) */
    public?: boolean;
    /** Required permissions to access the route (OR logic) */
    permissions?: Permission[];
  }
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  login: string;
  firstName: string;
  lastName: string;
  email?: string;
  permissions: Permission[];
  tenantId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
}

// ─── Auth requests / responses ───────────────────────────────────────────────

export interface LoginRequest {
  login: string;
  password: string;
}

export interface MicrosoftSSOLoginRequest {
  accessToken: string;
}

export interface AuthResult {
  accessToken: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface ThemeSettings {
  darkMode: boolean;
  primaryColor: ThemeColorName;
}

export const THEME_COLORS = {
  blue: "#3B82F6",
  green: "#10B981",
  purple: "#8B5CF6",
  orange: "#F59E0B",
  red: "#EF4444",
} as const;

export type ThemeColorName = keyof typeof THEME_COLORS;

// ─── Module System ───────────────────────────────────────────────────────────

/**
 * Standard module interface for eAppFlow modules.
 *
 * Each module (e.g. Identity, Sales, Administration) implements this
 * interface to contribute routes, menu items, permissions and optionally
 * an install hook to the shell.
 */
export interface EafModule {
  /** Unique module identifier (e.g. "identity") */
  id: string;
  /** Human-readable module name */
  name: string;
  /** Module version */
  version?: string;
  /** Vue Router routes contributed by this module */
  routes?: RouteRecordRaw[];
  /** Menu modules contributed by this module */
  menuModules?: EafMenuModule[];
  /** Translation messages for the module's menu items (resolved via i18n) */
  menuI18nMessages?: I18nOptions["messages"];
  /** Permissions declared by this module (for documentation / validation) */
  permissions?: Permission[];

  /**
   * Optional install hook called when the module is registered.
   * Use this to provide DI keys, register components, etc.
   */
  install?(app: App, config?: unknown): void | Promise<void>;
}

export interface ModuleRegistrationResult {
  /** All routes collected from modules */
  routes: RouteRecordRaw[];
  /** All menu modules collected from modules */
  menuModules: EafMenuModule[];
  /** All permissions collected from modules (deduplicated) */
  permissions: Permission[];
  /** IDs of all registered modules */
  moduleIds: string[];
}

// ─── Shared core types for the eAppFlow UI Shell ─────────────────────────

/** Common permission type (opaque string — defined by host app) */
export type Permission = string;

// ─── Navigation / Menu ───────────────────────────────────────────────────────

export interface EafMenuItem {
  name: string;
  /**
   * Translation key for the item's label, resolved via the global i18n
   * instance. When set and a translation exists, it is shown instead of
   * `name` (which then acts as the fallback label).
   */
  nameKey?: string;
  icon?: string;
  path: string;
  component?: () => Promise<unknown>;
  permissions?: Permission[];
  isVisible?: (userPermissions: Permission[]) => boolean;
}

export interface EafMenuModule {
  name: string;
  /**
   * Translation key for the group's label, resolved the same way as
   * `EafMenuItem.nameKey` (see there for the full explanation).
   */
  nameKey?: string;
  icon: string;
  items: EafMenuItem[];
  isVisible?: (userPermissions: Permission[]) => boolean;
}

export interface EafFilteredMenuModule {
  name: string;
  nameKey?: string;
  icon: string;
  items: EafMenuItem[];
}

// ─── Navigation guard ────────────────────────────────────────────────────────

export interface NavigationGuardOptions {
  requireAuth?: boolean;
  loginRoute?: string;
  forbiddenRoute?: string;
}

// ─── Messages / Toast ────────────────────────────────────────────────────────

export interface ToastMessage {
  severity: "success" | "info" | "warn" | "error";
  summary: string;
  detail: string;
  life?: number;
}

// ─── EafClasses (class overrides) ───────────────────────────────────────────

export type {
  EafClasses,
  AuthorizedLayoutClasses,
  SidebarClasses,
  HeaderClasses,
  FooterClasses,
  MenuClasses,
  UnauthorizedLayoutClasses,
  UiClasses,
  UiCardClasses,
} from "./eaf-classes";

// ─── App Config ──────────────────────────────────────────────────────────────

export interface AppConfig {
  name: string;
  version: string;
  environment?: string;
  /** Optional custom logo component */
  logo?: EafLogo | EafLogoSrc;
  /** Optional CSS class overrides for shell elements */
  classes?: EafClasses;
}

export type { EafLogo, EafLogoSrc, LogoPlacement } from "./eaf-logo";

// ─── I18n Config ──────────────────────────────────────────────────────────────

export type { I18nConfig, Language } from "./i18n";

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationMessage {
  message: string;
  validationErrors: string[];
  severity?: "error" | "warn" | "info" | "success";
}

// ─── Re-exports from core ────────────────────────────────────────────────────
