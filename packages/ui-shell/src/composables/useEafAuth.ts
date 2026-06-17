import { inject, type InjectionKey } from "vue";
import { useAuthStore } from "../stores/useAuthStore";

export interface AuthContext {
  user: ReturnType<typeof useAuthStore>["user"];
  isAuthenticated: ReturnType<typeof useAuthStore>["isAuthenticated"];
  userPermissions: ReturnType<typeof useAuthStore>["userPermissions"];
  userName: ReturnType<typeof useAuthStore>["userName"];
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restorePassword: (email: string) => Promise<void>;
  recoverPassword: (token: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export const AUTH_KEY: InjectionKey<AuthContext> = Symbol("auth");

export function useEafAuth(): AuthContext {
  const store = useAuthStore();
  const injected = inject<AuthContext | null>(AUTH_KEY, null);

  if (injected) {
    return injected;
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    userPermissions: store.userPermissions,
    userName: store.userName,
    login: store.login,
    logout: store.logout,
    restorePassword: store.restorePassword,
    recoverPassword: store.recoverPassword,
    hasPermission: store.hasPermission,
    hasAnyPermission: store.hasAnyPermission,
    hasAllPermissions: store.hasAllPermissions,
  };
}
