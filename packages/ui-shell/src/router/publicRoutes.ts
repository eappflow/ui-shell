import type { RouteRecordRaw } from "vue-router";

/**
 * Creates public (non-authenticated) route definitions with
 * the ui-shell generic auth views already wired in.
 *
 * These routes handle: login, password reset request,
 * password recovery with token.
 *
 * Use in your app's router configuration:
 *
 * ```ts
 * import { createPublicRoutes } from "@eappflow/ui-shell";
 *
 * const router = createRouter({
 *   routes: [
 *     ...createPublicRoutes(),
 *     // your protected routes...
 *   ],
 * });
 * ```
 */
export function createPublicRoutes(): RouteRecordRaw[] {
  return [
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { public: true },
    },
    {
      path: "/restore-password",
      name: "restore-password",
      component: () => import("../views/RestorePasswordView.vue"),
      meta: { public: true },
    },
    {
      path: "/recover-password/:token?",
      name: "recover-password",
      component: () => import("../views/RecoverPasswordView.vue"),
      meta: { public: true },
    },
  ];
}