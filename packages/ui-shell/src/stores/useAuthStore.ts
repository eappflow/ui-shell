import { defineStore } from "pinia";
import { ref, computed, inject } from "vue";
import type { AuthResult, User } from "../types";
import {
  AUTH_SERVICE_KEY,
  MICROSOFT_SSO_SERVICE_KEY,
  type AuthService,
} from "../services/interfaces";
import { createDefaultAuthService } from "../services/defaultAuthService";
import { createDefaultMsalInstance } from "../services/defaultMsalInstance";
import { createDefaultMicrosoftSSOConfig } from "../services/defaultSSOService";
import { useActionValidation } from "@eappflow/ui-shell-components";
import * as msal from "@azure/msal-browser";
import { Router } from "vue-router";

const LINK_MICROSOFT_ACCOUNT_STATE_PREFIX = "link-account:";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const isInitializing = ref(false);
  const microsoftAccountLinkResult = ref<boolean | null>(null);

  let msalInstance = createDefaultMsalInstance();

  // Get MicrosoftSSOService via DI, fall back to default (throws on real use)
  const microsoftSSOService =
    inject(MICROSOFT_SSO_SERVICE_KEY, undefined) ??
    createDefaultMicrosoftSSOConfig();

  // Get AuthService via DI, fall back to default (throws on real use)
  const authService: AuthService =
    inject(AUTH_SERVICE_KEY, undefined) ?? createDefaultAuthService();

  const isSessionMode = authService.mode === "session";

  // Parses and displays API/service errors via the shared validation banner
  const actionValidation = useActionValidation();

  const isUsingMicrosoftSSO = computed(
    () => microsoftSSOService.enabled !== false,
  );

  // The access token is a transport detail, not auth state: in session mode the
  // credential lives in an HttpOnly cookie and never reaches JS, so a hydrated
  // user is the only signal that works in both modes.
  const isAuthenticated = computed(() => !isInitializing.value && !!user.value);

  const userPermissions = computed(() => user.value?.permissions || []);
  const userName = computed(() => {
    if (!user.value) return "";
    return `${user.value.firstName} ${user.value.lastName}`;
  });

  async function login(login: string, password: string): Promise<void> {
    actionValidation.clearErrors();
    const result = await authService.login({ login, password });
    await completeLogin(result);
  }

  /**
   * Shared tail of every sign-in flow (password, Microsoft SSO). The service's
   * return value carries the contract, so there is nothing to branch on: a
   * token means token mode, nothing means the backend already holds the
   * session (cookie) and the user can be hydrated right away.
   */
  async function completeLogin(result?: AuthResult | void): Promise<void> {
    if (!result) {
      await loadCurrentUser();
      return;
    }

    if (!result.accessToken) {
      throw new Error("No access token received");
    }

    await saveAccessToken(result.accessToken);
  }

  async function logout(): Promise<void> {
    try {
      await authService.logout();
    } finally {
      user.value = null;
      accessToken.value = null;
      localStorage.removeItem("access_token");
    }
  }

  async function loadCurrentUser(): Promise<void> {
    try {
      const userData = await authService.getCurrentUser();
      user.value = userData;
    } catch {
      // Never let a failing logout mask the real reason we got here
      await logout().catch(() => {});
      throw new Error("Failed to load user data");
    }
  }

  async function saveAccessToken(token: string): Promise<void> {
    accessToken.value = token;
    localStorage.setItem("access_token", token);

    // Load user data after login
    await loadCurrentUser();
  }

  async function restorePassword(email: string): Promise<void> {
    await authService.requestPasswordReset({ email });
  }

  async function recoverPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    await authService.confirmPasswordReset({ token, newPassword });
  }

  function hasPermission(permission: string): boolean {
    if (!user.value) return false;
    return user.value.permissions.includes(permission);
  }

  function hasAnyPermission(permissions: string[]): boolean {
    if (!user.value) return false;
    return permissions.some((p) => user.value!.permissions.includes(p));
  }

  function hasAllPermissions(permissions: string[]): boolean {
    if (!user.value) return false;
    return permissions.every((p) => user.value!.permissions.includes(p));
  }

  /**
   * Restore the signed-in user on app boot. Named after the session rather than
   * storage: in session mode the credential is a cookie that JS cannot see.
   */
  async function restoreSession(): Promise<void> {
    if (isSessionMode) {
      // The session cookie is invisible to JS, so ask the backend; an error just
      // means "not logged in". Don't call logout() here - an anonymous visitor
      // must not fire a logout request on every page load.
      isInitializing.value = true;
      try {
        user.value = await authService.getCurrentUser();
      } catch {
        user.value = null;
      } finally {
        isInitializing.value = false;
      }
      return;
    }

    const storedToken = localStorage.getItem("access_token");
    if (!storedToken) return;

    isInitializing.value = true;
    accessToken.value = storedToken;
    try {
      await loadCurrentUser();
    } catch {
      // loadCurrentUser() already logged out and cleared the stale token
    } finally {
      isInitializing.value = false;
    }
  }

  /** @deprecated Use `restoreSession()`. Kept for host apps that call it directly. */
  const initializeFromStorage = restoreSession;

  // ─── Microsoft SSO Start ──────────────────────────────────────────────────────────

  async function loginWithMicrosoftSSO(redirectUrl: string): Promise<void> {
    try {
      if (!microsoftSSOService.config?.clientId) {
        throw new Error("Microsoft SSO configuration is not available.");
      }

      await msalInstance.loginRedirect({
        scopes: microsoftSSOService.config.scopes,
        state: redirectUrl,
      });
    } catch (error) {
      actionValidation.handleApiError(error);
      throw error;
    }
  }

  /**
   * Links a Microsoft account via the same redirect flow as loginWithMicrosoftSSO, not a popup -
   * a popup would boot this app a second time inside itself, and that throwaway instance would
   * read the opener's real session token from shared localStorage, risking a silent logout race.
   */
  async function linkMicrosoftAccount(returnUrl: string): Promise<void> {
    try {
      if (!microsoftSSOService.config?.clientId) {
        throw new Error("Microsoft SSO configuration is not available.");
      }

      await msalInstance.loginRedirect({
        scopes: microsoftSSOService.config.scopes,
        state: `${LINK_MICROSOFT_ACCOUNT_STATE_PREFIX}${returnUrl}`,
      });
    } catch (error) {
      actionValidation.handleApiError(error);
      throw error;
    }
  }

  function clearMicrosoftAccountLinkResult(): void {
    microsoftAccountLinkResult.value = null;
  }

  async function initializeMsalInstance(router: Router): Promise<void> {
    try {
      msalInstance = await msal.createStandardPublicClientApplication({
        auth: microsoftSSOService.config as msal.Configuration["auth"],
      });
      const redirectUrl = await handleMicrosoftSSORedirect();
      if (redirectUrl !== null) {
        router.push(redirectUrl).catch((err) => {
          console.error(
            "Failed to navigate after Microsoft SSO redirect:",
            err,
          );
        });
      }
    } catch (error) {
      console.error("Failed to initialize MSAL instance:", error);
    }
  }

  // Returns the URL to navigate to after a Microsoft SSO redirect, or null
  // when the page load isn't an SSO redirect callback (the common case) so
  // the current route is left untouched.
  async function handleMicrosoftSSORedirect(): Promise<string | null> {
    const authenticationResult = await msalInstance.handleRedirectPromise();

    if (!authenticationResult || !authenticationResult.accessToken) {
      return null;
    }

    const state = authenticationResult.state ?? "";
    if (state.startsWith(LINK_MICROSOFT_ACCOUNT_STATE_PREFIX)) {
      const returnUrl = state.slice(LINK_MICROSOFT_ACCOUNT_STATE_PREFIX.length);
      try {
        await authService.linkMicrosoftAccount({
          accessToken: authenticationResult.accessToken,
        });
        microsoftAccountLinkResult.value = true;
        await loadCurrentUser();
      } catch (error) {
        microsoftAccountLinkResult.value = false;
        actionValidation.handleApiError(error);
      }
      return returnUrl.startsWith("/") ? returnUrl : "/";
    }

    try {
      const result = await microsoftSSOService.login(authenticationResult);
      await completeLogin(result);
    } catch (error) {
      actionValidation.handleApiError(error);
      return "/login";
    }
    return state.startsWith("/") ? state : "/";
  }

  // ─── Microsoft SSO End ──────────────────────────────────────────────────────────

  // Initialize on store creation. Deferred by one microtask: this store is created
  // synchronously during EAppFlowUIShell's plugin install(), which runs before the host
  // app calls setAxiosInstance() (see apps/web-hq-portal/src/main.ts) - calling this
  // immediately would race the API client's readiness and silently log the user out.
  // Confirmed as a real, reproducible bug (not just theoretical) via the Microsoft
  // account-linking redirect flow, which always does a full page reload on return.
  queueMicrotask(() => {
    restoreSession();
  });

  return {
    user,
    accessToken,
    isInitializing,
    isAuthenticated,
    isUsingMicrosoftSSO,
    microsoftAccountLinkResult,
    userPermissions,
    userName,
    login,
    logout,
    loadCurrentUser,
    restorePassword,
    recoverPassword,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    restoreSession,
    initializeFromStorage,
    loginWithMicrosoftSSO,
    linkMicrosoftAccount,
    clearMicrosoftAccountLinkResult,
    initializeMsalInstance,
  };
});
