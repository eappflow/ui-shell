// ─── Shared core types for the eAppFlow UI Shell ─────────────────────────

import type { InjectionKey } from 'vue'

/** Common permission type (opaque string — defined by host app) */
export type Permission = string

// ─── Navigation / Menu ───────────────────────────────────────────────────────

export interface EafMenuItem {
  name: string
  icon?: string
  path: string
  component?: () => Promise<unknown>
  permissions?: Permission[]
  isVisible?: (userPermissions: Permission[]) => boolean
}

export interface EafMenuModule {
  name: string
  icon: string
  items: EafMenuItem[]
  isVisible?: (userPermissions: Permission[]) => boolean
}

export interface EafFilteredMenuModule {
  name: string
  icon: string
  items: EafMenuItem[]
}

// ─── Navigation guard ────────────────────────────────────────────────────────

export interface NavigationGuardOptions {
  requireAuth?: boolean
  loginRoute?: string
  forbiddenRoute?: string
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

// ─── Validation ──────────────────────────────────────────────────────────────

export interface ValidationMessage {
  message: string
  validationErrors: string[]
  severity?: 'error' | 'warn' | 'info' | 'success'
}
