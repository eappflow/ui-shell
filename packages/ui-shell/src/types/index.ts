// ─── Shared types for the UI Shell ───────────────────────────────────────────

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

export interface ValidationMessage {
  message: string
  validationErrors: string[]
  severity?: 'error' | 'warn' | 'info' | 'success'
}

// ─── App Config ──────────────────────────────────────────────────────────────

export interface AppConfig {
  name: string
  version: string
  environment: string
}