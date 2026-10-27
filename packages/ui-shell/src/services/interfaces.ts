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
  ThemeSettings,
  AppConfig,
  MicrosoftSSOLoginRequest,
  I18nConfig,
} from "../types";
import type { EafMenuModule } from "../types";
import type { InjectionKey } from "vue";
import * as msal from "@azure/msal-browser";

// ─── Auth Service ────────────────────────────────────────────────────────────

export interface AuthService {
  /**
   * Which transport the backend uses.
   *
   * - omitted / `"token"` — `login` resolves with an access token, which the
   *   shell keeps in `localStorage` and sends as a header (host's HTTP client).
   * - `"session"` — the backend keeps the session itself (e.g. an HttpOnly
   *   cookie), `login` resolves with nothing, and the shell asks
   *   `getCurrentUser()` on boot instead of looking for a stored token.
   */
  mode?: "token" | "session";

  /**
   * Authenticate user with credentials. Resolves with the access token in
   * `token` mode, or with nothing in `session` mode.
   */
  login(request: LoginRequest): Promise<AuthResult | void>;

  /** Logout current user */
  logout(): Promise<void>;

  /** Get current authenticated user data */
  getCurrentUser(): Promise<User>;

  /** Request password reset email */
  requestPasswordReset(request: PasswordResetRequest): Promise<void>;

  /** Confirm password reset with token */
  confirmPasswordReset(request: PasswordResetConfirm): Promise<void>;

  /** Change password for authenticated user */
  changePassword(request: ChangePasswordRequest): Promise<void>;

  /** Link a Microsoft account (already validated via an Entra ID access token) to the current user */
  linkMicrosoftAccount(request: MicrosoftSSOLoginRequest): Promise<void>;
}

/**
 * Convenience subtype for token-based backends: narrower `mode` and a `login`
 * that must resolve with an access token. Assignable to `AuthService`.
 */
export interface TokenAuthService extends AuthService {
  mode?: "token";
  login(request: LoginRequest): Promise<AuthResult>;
}

/**
 * Convenience subtype for session-based backends: narrower `mode` and a `login`
 * that resolves with nothing. Assignable to `AuthService`.
 */
export interface SessionAuthService extends AuthService {
  mode: "session";
  login(request: LoginRequest): Promise<void>;
}

// ─── Microsoft SSO Service ───────────────────────────────────────────────────

export interface MicrosoftSSOService {
  enabled?: boolean;
  config: MicrosoftSSOConfig;
  /**
   * Authenticate user with Microsoft SSO access token. Resolves with the shell's
   * access token, or nothing when the AuthService is in `session` mode.
   */
  login(response: MicrosoftSSOLoginRequest): Promise<AuthResult | void>;
}

export type MicrosoftSSOConfig = Pick<
  msal.Configuration["auth"],
  "clientId" | "authority" | "redirectUri"
> & {
  scopes: Array<string>;
};

// ─── Menu Service ────────────────────────────────────────────────────────────

export interface MenuService {
  /** Get menu structure (optionally filtered by permissions) */
  getMenu(): EafMenuModule[];
}

// ─── Theme Service ───────────────────────────────────────────────────────────

export interface ThemeService {
  /** Get saved theme settings (from localStorage or remote) */
  getSettings(): ThemeSettings;

  /** Persist theme settings */
  saveSettings(settings: ThemeSettings): void;

  /** Apply theme to the DOM */
  applyTheme(settings: ThemeSettings): void;
}

// ─── AI Chat Service ─────────────────────────────────────────────────────────

/**
 * The AI chat's backend (its shape is `useEafChat`'s, in ui-shell-components).
 * The layout shows the chat, whose tools can fill the forms on screen, once a
 * host app or module provides it under `AI_CHAT_SERVICE_KEY`.
 */
export type { AiChatService } from "@eappflow/ui-shell-components";
export { AI_CHAT_SERVICE_KEY } from "@eappflow/ui-shell-components";

// ─── Injection Keys ──────────────────────────────────────────────────────────

export const AUTH_SERVICE_KEY: InjectionKey<AuthService> =
  Symbol("authService");
export const MENU_SERVICE_KEY: InjectionKey<MenuService> =
  Symbol("menuService");
export const THEME_SERVICE_KEY: InjectionKey<ThemeService> =
  Symbol("themeService");
export const MICROSOFT_SSO_SERVICE_KEY: InjectionKey<MicrosoftSSOService> =
  Symbol("microsoftSSOService");
export const APP_CONFIG_KEY: InjectionKey<AppConfig> = Symbol("appConfig");
export const I18n_CONFIG_KEY: InjectionKey<I18nConfig> = Symbol("i18nConfig");
