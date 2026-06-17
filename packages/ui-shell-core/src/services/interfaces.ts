/**
 * Abstract service interfaces for Dependency Injection.
 *
 * The ui-shell-core package defines these interfaces; host applications
 * provide concrete implementations (real or fake) at bootstrap time.
 *
 * This follows the Dependency Inversion Principle:
 *   High-level modules (stores, components) depend on abstractions
 *   (these interfaces), not on concrete implementations.
 */

import type { EafMenuModule, AppConfig } from '../types'
import type { InjectionKey } from 'vue'

// ─── Auth Service ────────────────────────────────────────────────────────────

export interface AuthService {
  /** Authenticate user with credentials */
  login(request: { login: string; password: string }): Promise<{ accessToken: string }>

  /** Logout current user */
  logout(): Promise<void>

  /** Get current authenticated user data */
  getCurrentUser(): Promise<{
    id: string
    login: string
    firstName: string
    lastName: string
    email?: string
    permissions: string[]
    tenantId?: string
  }>

  /** Request password reset email */
  requestPasswordReset(request: { email: string }): Promise<void>

  /** Confirm password reset with token */
  confirmPasswordReset(request: { token: string; newPassword: string }): Promise<void>

  /** Change password for authenticated user */
  changePassword(request: { currentPassword: string; newPassword: string }): Promise<void>
}

// ─── Menu Service ────────────────────────────────────────────────────────────

export interface MenuService {
  /** Get menu structure (optionally filtered by permissions) */
  getMenu(): EafMenuModule[]
}

// ─── Theme Service ───────────────────────────────────────────────────────────

export interface ThemeService {
  /** Get saved theme settings (from localStorage or remote) */
  getSettings(): { darkMode: boolean; primaryColor: string }

  /** Persist theme settings */
  saveSettings(settings: { darkMode: boolean; primaryColor: string }): void

  /** Apply theme to the DOM */
  applyTheme(settings: { darkMode: boolean; primaryColor: string }): void
}

// ─── Injection Keys ──────────────────────────────────────────────────────────

export const AUTH_SERVICE_KEY: InjectionKey<AuthService> = Symbol('authService')
export const MENU_SERVICE_KEY: InjectionKey<MenuService> = Symbol('menuService')
export const THEME_SERVICE_KEY: InjectionKey<ThemeService> = Symbol('themeService')
export const APP_CONFIG_KEY: InjectionKey<AppConfig> = Symbol('appConfig')
