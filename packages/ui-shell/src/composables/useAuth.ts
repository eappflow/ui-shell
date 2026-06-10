import { inject, type InjectionKey } from "vue";
import { useAuthStore } from "../stores/useAuthStore";

export interface AuthContext {
  user: ReturnType<typeof useAuthStore>["user"];
  isAuthenticated: ReturnType<typeof useAuthStore>["isAuthenticated"];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AUTH_KEY: InjectionKey<AuthContext> = Symbol("auth");

export function useAuth(): AuthContext {
  const store = useAuthStore();
  const injected = inject<AuthContext | null>(AUTH_KEY, null);

  if (injected) {
    return injected;
  }

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    login: store.login,
    logout: store.logout,
  };
}