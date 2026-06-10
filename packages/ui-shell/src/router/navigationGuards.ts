import type { Router } from "vue-router";
import { useAuthStore } from "../stores/useAuthStore";

export interface NavigationGuardOptions {
  requireAuth?: boolean;
  allowedRoles?: string[];
  loginRoute?: string;
  forbiddenRoute?: string;
}

export function createNavigationGuards(
  router: Router,
  options: NavigationGuardOptions = {},
) {
  const {
    requireAuth = true,
    allowedRoles = [],
    loginRoute = "/login",
    forbiddenRoute = "/forbidden",
  } = options;

  router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();

    if (to.meta?.public) {
      next();
      return;
    }

    if (requireAuth && !authStore.isAuthenticated) {
      next(loginRoute);
      return;
    }

    const routeRoles = (to.meta?.roles as string[]) ?? allowedRoles;
    if (
      routeRoles.length > 0 &&
      !routeRoles.includes(authStore.user?.role ?? "")
    ) {
      next(forbiddenRoute);
      return;
    }

    next();
  });
}