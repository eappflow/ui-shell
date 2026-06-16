// ─── Shared types for the UI Shell ───────────────────────────────────────────

import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'

/** User permission (opaque string — defined by host app) */
export type Permission = string

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  login: string
  firstName: string
  lastName: string
  email?: string
  permissions: Permission[]
  tenantId?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  accessToken: string | null
}

// ─── Auth requests / responses ───────────────────────────────────────────────

export interface LoginRequest {
  login: string
  password: string
}

export interface AuthResult {
  accessToken: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// ─── Navigation / Menu ───────────────────────────────────────────────────────

export interface MenuItem {
  name: string
  icon?: string
  path: string
  component?: () => Promise<unknown>
  permissions?: Permission[]
  isVisible?: (userPermissions: Permission[]) => boolean
}

export interface MenuModule {
  name: string
  icon: string
  items: MenuItem[]
  isVisible?: (userPermissions: Permission[]) => boolean
}

export interface FilteredMenuModule {
  name: string
  icon: string
  items: MenuItem[]
}

// ─── Navigation guard ────────────────────────────────────────────────────────

export interface NavigationGuardOptions {
  requireAuth?: boolean
  loginRoute?: string
  forbiddenRoute?: string
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface ThemeSettings {
  darkMode: boolean
  primaryColor: ThemeColorName
}

export const THEME_COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  orange: '#F59E0B',
  red: '#EF4444',
} as const

export type ThemeColorName = keyof typeof THEME_COLORS

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiErrorResponse {
  success: boolean
  code: string
  message: string
  traceId: string
  validationErrors?: Record<string, string[]>
  details?: unknown
}

// ─── Form Validation ─────────────────────────────────────────────────────────

export interface FormValidation {
  registerField: (fieldName: string) => void
  unregisterField: (fieldName: string) => void
  setFieldError: (fieldName: string, messages: string | string[]) => void
  getFieldError: (fieldName: string) => string | string[] | undefined
  hasFieldError: (fieldName: string) => boolean
  clearErrors: () => void
  clearFieldError: (fieldName: string) => void
  hasErrors: () => boolean
  handleApiError: (error: unknown) => boolean
  /** General validation message (may be a Ref — unwrap when reading) */
  generalMessage: unknown
  /** Summary errors list (may be a Ref — unwrap when reading) */
  summaryErrors: unknown
}

export interface ValidationConfig {
  registeredFields?: string[]
  showAllErrors?: boolean
}

// ─── Messages / Toast ────────────────────────────────────────────────────────

export interface ToastMessage {
  severity: 'success' | 'info' | 'warn' | 'error'
  summary: string
  detail: string
  life?: number
}

// ─── App Config ──────────────────────────────────────────────────────────────

export interface AppConfig {
  name: string
  version: string
  environment?: string
}

// ─── Plugin System ───────────────────────────────────────────────────────────

/**
 * Standard plugin interface for eAppFlow modules.
 *
 * Each module (e.g. Identity, Sales, Administration) implements this
 * interface to contribute routes, menu items, permissions and optionally
 * an install hook to the shell.
 */
export interface EafPlugin {
  /** Unique plugin identifier (e.g. "identity") */
  id: string
  /** Human-readable plugin name */
  name: string
  /** Plugin version */
  version?: string
  /** Vue Router routes contributed by this plugin */
  routes?: RouteRecordRaw[]
  /** Menu modules contributed by this plugin */
  menuModules?: MenuModule[]
  /** Permissions declared by this plugin (for documentation / validation) */
  permissions?: Permission[]
  /**
   * Optional install hook called when the plugin is registered.
   * Use this to provide DI keys, register components, etc.
   */
  install?(app: App, config?: unknown): void | Promise<void>
}

export interface PluginRegistrationResult {
  /** All routes collected from plugins */
  routes: RouteRecordRaw[]
  /** All menu modules collected from plugins */
  menuModules: MenuModule[]
  /** All permissions collected from plugins (deduplicated) */
  permissions: Permission[]
  /** IDs of all registered plugins */
  pluginIds: string[]
}

export interface ValidationMessage {
  message: string
  validationErrors: string[]
  severity?: 'error' | 'warn' | 'info' | 'success'
}