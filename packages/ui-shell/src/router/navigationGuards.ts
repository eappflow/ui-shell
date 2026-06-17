import type { Router } from "vue-router";
import { watch } from "vue";
import { useAuthStore } from "../stores/useAuthStore";
import type { NavigationGuardOptions } from "../types";

/**
 * Creates navigation guards for the application.
 *
 * Features:
 * - Waits for auth initialization before checking
 * - Redirects unauthenticated users to login
 * - Prevents authenticated users from accessing login
 * - Handles permission-based route access
 *
 * @param router - Vue Router instance
 * @param options - Optional configuration
 */
export function createNavigationGuards(
  router: Router,
  options: NavigationGuardOptions = {},
) {
  debugger;
  const {
    requireAuth = true,
    loginRoute = "/login",
    forbiddenRoute = "/no-access",
  } = options;

  router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();

    // Allow public routes without auth
    if (to.meta?.public) {
      next();
      return;
    }

    // Wait for auth initialization to complete
    if (authStore.isInitializing) {
      await new Promise<void>((resolve) => {
        const unwatch = watch(
          () => authStore.isInitializing,
          (isInitializing) => {
            if (!isInitializing) {
              unwatch();
              resolve();
            }
          },
        );
      });
    }

    // Check authentication
    if (requireAuth && !authStore.isAuthenticated) {
      next({ path: loginRoute, query: { redirect: to.fullPath } });
      return;
    }

    // If authenticated and trying to access login, redirect to home
    if (to.path === loginRoute && authStore.isAuthenticated) {
      next("/");
      return;
    }

    // Check route-level permissions (meta.permissions)
    const requiredPermissions = to.meta?.permissions as string[] | undefined;
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAccess = requiredPermissions.some((perm) =>
        authStore.hasPermission(perm),
      );
      if (!hasAccess) {
        next(forbiddenRoute);
        return;
      }
    }

    next();
  });
}
