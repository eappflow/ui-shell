/**
 * Abstract service interfaces for Dependency Injection.
 *
 * The ui-shell package defines these interfaces; host applications
 * provide concrete implementations (real or fake) at bootstrap time.
 *
 * This follows the Dependency Inversion Principle:
 *   High-level modules (stores, components) depend on abstractions
 *   (these interfaces), not on concrete implementations.
 */

import type {
  User,
  LoginRequest,
  AuthResult,
  PasswordResetRequest,
  PasswordResetConfirm,
  ChangePasswordRequest,
  MenuModule,
  ThemeSettings,
} from '../types'

// ─── Auth Service ────────────────────────────────────────────────────────────

export interface AuthService {
  /** Authenticate user with credentials */
  login(request: LoginRequest): Promise<AuthResult>

  /** Logout current user */
  logout(): Promise<void>

  /** Get current authenticated user data */
  getCurrentUser(): Promise<User>

  /** Request password reset email */
  requestPasswordReset(request: PasswordResetRequest): Promise<void>

  /** Confirm password reset with token */
  confirmPasswordReset(request: PasswordResetConfirm): Promise<void>

  /** Change password for authenticated user */
  changePassword(request: ChangePasswordRequest): Promise<void>
}

// ─── Menu Service ────────────────────────────────────────────────────────────

export interface MenuService {
  /** Get menu structure (optionally filtered by permissions) */
  getMenu(): MenuModule[]
}

// ─── Theme Service ───────────────────────────────────────────────────────────

export interface ThemeService {
  /** Get saved theme settings (from localStorage or remote) */
  getSettings(): ThemeSettings

  /** Persist theme settings */
  saveSettings(settings: ThemeSettings): void

  /** Apply theme to the DOM */
  applyTheme(settings: ThemeSettings): void
}

// ─── Injection Keys ──────────────────────────────────────────────────────────

import type { InjectionKey } from 'vue'

export const AUTH_SERVICE_KEY: InjectionKey<AuthService> = Symbol('authService')
export const MENU_SERVICE_KEY: InjectionKey<MenuService> = Symbol('menuService')
export const THEME_SERVICE_KEY: InjectionKey<ThemeService> = Symbol('themeService')