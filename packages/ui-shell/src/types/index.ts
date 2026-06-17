// ─── Shared types for the UI Shell ───────────────────────────────────────────

import type { RouteRecordRaw } from 'vue-router'
import type { App } from 'vue'
import type { Permission, EafMenuModule, NavigationGuardOptions, AppConfig } from '@eappflow/ui-shell-core'

// ─── Re-exports from core ────────────────────────────────────────────────────
export type { Permission, EafMenuModule, NavigationGuardOptions, AppConfig }

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
  id: string
  /** Human-readable module name */
  name: string
  /** Module version */
  version?: string
  /** Vue Router routes contributed by this module */
  routes?: RouteRecordRaw[]
  /** Menu modules contributed by this module */
  menuModules?: EafMenuModule[]
  /** Permissions declared by this module (for documentation / validation) */
  permissions?: Permission[]
  /**
   * Optional install hook called when the module is registered.
   * Use this to provide DI keys, register components, etc.
   */
  install?(app: App, config?: unknown): void | Promise<void>
}

export interface ModuleRegistrationResult {
  /** All routes collected from modules */
  routes: RouteRecordRaw[]
  /** All menu modules collected from modules */
  menuModules: EafMenuModule[]
  /** All permissions collected from modules (deduplicated) */
  permissions: Permission[]
  /** IDs of all registered modules */
  moduleIds: string[]
}