import { defineStore } from "pinia";
import { ref, computed, inject } from "vue";
import type { User } from "../types";
import {
  AUTH_SERVICE_KEY,
  MSAL_INSTANCE_KEY,
  type AuthService,
} from "../services/interfaces";
import { createDefaultAuthService } from "../services/defaultAuthService";
import { createDefaultMsalInstance } from "../services/defaultMsalInstace";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const isInitializing = ref(false);

  // Get AuthService via DI, fall back to default (throws on real use)
  const authService: AuthService =
    inject(AUTH_SERVICE_KEY, undefined) ?? createDefaultAuthService();
  let msalInstance = createDefaultMsalInstance();

  const isAuthenticated = computed(() => {
    if (isInitializing.value) return false;
    return !!accessToken.value && !!user.value;
  });

  const usingMicrosoftSSO = computed(() => {
    return authService.microsoftSSOEnabled === true;
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

    accessToken.value = result.accessToken;
    localStorage.setItem("access_token", result.accessToken);

    // Load user data after login
    await loadCurrentUser();
  }

  async function loginWithMicrosoftSSO(redirectUrl: string): Promise<void> {
    if (authService.microsoftSSOConfig === undefined) {
      throw new Error("Microsoft SSO configuration is not available.");
    }

    await msalInstance.loginRedirect({
      scopes: authService.microsoftSSOConfig.scopes,
      state: redirectUrl,
    });
  }

  async function handleMicrosoftSSORedirect(): Promise<string> {
    const authenticationResult = await msalInstance.handleRedirectPromise();

    if (authenticationResult && authenticationResult.accessToken) {
      const result =
        await authService.handleMicrosoftSSORedirect(authenticationResult);
      accessToken.value = result.accessToken;
      localStorage.setItem("access_token", result.accessToken);

      // Load user data after login
      await loadCurrentUser();
      return authenticationResult.state || "/";
    }
    return "/";
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

  async function initializeMsalInstance(msalInstanceValue: any): Promise<void> {
    msalInstance = msalInstanceValue ?? createDefaultMsalInstance();
  }

  // Initialize on store creation
  initializeFromStorage();

  return {
    user,
    accessToken,
    isInitializing,
    isAuthenticated,
    usingMicrosoftSSO,
    userPermissions,
    userName,
    login,
    loginWithMicrosoftSSO,
    handleMicrosoftSSORedirect,
    logout,
    loadCurrentUser,
    restorePassword,
    recoverPassword,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    initializeFromStorage,
    initializeMsalInstance,
  };
});
