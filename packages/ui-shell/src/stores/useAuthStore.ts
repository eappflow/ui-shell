import { defineStore } from "pinia";
import { ref, computed, inject } from "vue";
import type { User } from "../types";
import {
  AUTH_SERVICE_KEY,
  MICROSOFT_SSO_SERVICE_KEY,
  type AuthService,
} from "../services/interfaces";
import { createDefaultAuthService } from "../services/defaultAuthService";
import { createDefaultMsalInstance } from "../services/defaultMsalInstance";
import { createDefaultMicrosoftSSOConfig } from "../services/defaultSSOService";
import * as msal from "@azure/msal-browser";
import { Router } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const isInitializing = ref(false);

  let msalInstance = createDefaultMsalInstance();

  // Get MicrosoftSSOService via DI, fall back to default (throws on real use)
  const microsoftSSOService =
    inject(MICROSOFT_SSO_SERVICE_KEY, undefined) ??
    createDefaultMicrosoftSSOConfig();

  // Get AuthService via DI, fall back to default (throws on real use)
  const authService: AuthService =
    inject(AUTH_SERVICE_KEY, undefined) ?? createDefaultAuthService();

  const isUsingMicrosoftSSO = computed(
    () => microsoftSSOService.enabled !== false,
  );

  const isAuthenticated = computed(() => {
    if (isInitializing.value) return false;
    return !!accessToken.value && !!user.value;
  });

  const userPermissions = computed(() => user.value?.permissions || []);
  const userName = computed(() => {
    if (!user.value) return "";
    return `${user.value.firstName} ${user.value.lastName}`;
  });

  async function login(login: string, password: string): Promise<void> {
    const result = await authService.login({ login, password });

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
      await logout();
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

  async function initializeFromStorage(): Promise<void> {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      isInitializing.value = true;
      accessToken.value = storedToken;
      try {
        await loadCurrentUser();
      } catch {
        await logout();
      } finally {
        isInitializing.value = false;
      }
    }
  }

  // ─── Microsoft SSO Start ──────────────────────────────────────────────────────────

  async function loginWithMicrosoftSSO(redirectUrl: string): Promise<void> {
    if (!microsoftSSOService.config?.clientId) {
      throw new Error("Microsoft SSO configuration is not available.");
    }

    await msalInstance.loginRedirect({
      scopes: microsoftSSOService.config.scopes,
      state: redirectUrl,
    });
  }

  async function initializeMsalInstance(router: Router): Promise<void> {
    try {
      msalInstance = await msal.createStandardPublicClientApplication({
        auth: microsoftSSOService.config as msal.Configuration["auth"],
      });
      const redirectUrl = await handleMicrosoftSSORedirect();
      router.push(redirectUrl).catch((err) => {
        console.error("Failed to navigate after Microsoft SSO redirect:", err);
      });
    } catch (error) {
      console.error("Failed to initialize MSAL instance:", error);
    }
  }

  async function handleMicrosoftSSORedirect(): Promise<string> {
    const authenticationResult = await msalInstance.handleRedirectPromise();

    if (authenticationResult && authenticationResult.accessToken) {
      const result = await microsoftSSOService.login(authenticationResult);
      await saveAccessToken(result.accessToken);
      const state = authenticationResult.state;
      return state && state.startsWith("/") ? state : "/";
    }
    return "/";
  }

  // ─── Microsoft SSO End ──────────────────────────────────────────────────────────

  // Initialize on store creation
  initializeFromStorage();

  return {
    user,
    accessToken,
    isInitializing,
    isAuthenticated,
    isUsingMicrosoftSSO,
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
    initializeFromStorage,
    loginWithMicrosoftSSO,
    initializeMsalInstance,
  };
});
