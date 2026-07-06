/**
 * Build a route tree from modules using a component-layout pattern.
 *
 * Public routes (login, password recovery) are registered at the root level
 * without the layout wrapper. All module routes (and optionally extra routes)
 * are nested under a single layout route (e.g. AuthorizedLayout).
 *
 * Example output:
 * ```
 * /login              → LoginView (public, no layout)
 * /restore-password   → RestorePasswordView (public, no layout)
 * /                   → AuthorizedLayout
 *   /dashboard        → Dashboard (child)
 *   /employees        → EmployeesView (child)
 *   /users            → UsersView (child — from identity module)
 *   /settings         → Settings (child)
 * ```
 */

import type { Component } from "vue";
import type { RouteRecordRaw } from "vue-router";
import type { EafModule } from "../types";

export interface BuildModuleRoutesOptions {
  /**
   * The layout component that wraps all protected routes.
   * Typically `AuthorizedLayout` from the shell.
   */
  layout: Component | (() => Promise<Component>);

  /**
   * Public routes (login, password recovery, etc.) — rendered without layout.
   * Usually obtained from `createPublicRoutes()`.
   */
  publicRoutes?: RouteRecordRaw[];

  /**
   * Additional child routes to add under the layout
   * (e.g. dashboard, settings, change-password).
   */
  extraRoutes?: RouteRecordRaw[];

  /**
   * Base path for the layout route. Default: "/"
   */
  layoutPath?: string;

  /**
   * Route name for the layout route. Default: "app-layout"
   */
  layoutName?: string;
}

/**
 * Build a route tree from a list of modules.
 *
 * @param modules - Registered EafModule instances (containing `routes`)
 * @param options - Layout, public routes, extra routes
 * @returns       - Complete route tree array
 */
export function buildModuleRoutes(
  modules: EafModule[],
  options: BuildModuleRoutesOptions,
): RouteRecordRaw[] {
  const {
    layout,
    publicRoutes = [],
    extraRoutes = [],
    layoutPath = "/",
    layoutName = "app-layout",
  } = options;

  // Collect all module routes
  const moduleRoutes: RouteRecordRaw[] = [];
  for (const mod of modules) {
    if (mod.routes) {
      for (const route of mod.routes) {
        const meta = { ...route.meta, moduleId: mod.id };
        moduleRoutes.push({ ...route, meta });
      }
    }
  }

  // Build layout route with all protected pages as children
  const layoutRoute: RouteRecordRaw = {
    path: layoutPath,
    name: layoutName,
    component: layout,
    children: [...moduleRoutes, ...extraRoutes],
  };

  return [...publicRoutes, layoutRoute];
}
