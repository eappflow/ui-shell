/**
 * Module registry — merges contributions from all registered modules.
 *
 * Call `configureModules()` at app bootstrap to register all modules,
 * collect their routes, menu modules and permissions, then wire them
 * into the shell.
 */

import type { App } from "vue";
import { useEafNavigationStore } from "../stores/useEafNavigationStore";
import type { EafModule, ModuleRegistrationResult } from "../types";
import type { EafMenuModule } from "../types";

/**
 * Register a list of modules with the shell.
 *
 * For each module:
 *  1. Calls `mod.install(app, config)` if the hook is defined
 *  2. Collects routes, menu modules and permissions
 *
 * After all modules are processed, merges all menu modules
 * and sets them on the navigation store.
 *
 * @param modules - Array of EafModule instances
 * @param app     - Vue application instance
 * @param router  - Vue Router instance
 * @returns       - Aggregated result with all routes, menus, permissions
 */
export function configureModules(
  modules: EafModule[],
  app: App,
): ModuleRegistrationResult {
  const allRoutes: ModuleRegistrationResult["routes"] = [];
  const allMenuModules: ModuleRegistrationResult["menuModules"] = [];
  const allPermissions = new Set<string>();
  const moduleIds: string[] = [];

  for (const mod of modules) {
    moduleIds.push(mod.id);

    // 1. Install hook
    if (typeof mod.install === "function") {
      mod.install(app);
    }

    // 2. Collect routes
    if (mod.routes) {
      for (const route of mod.routes) {
        // Tag route with module id for traceability
        const meta = { ...route.meta, moduleId: mod.id };
        allRoutes.push({ ...route, meta });
      }
    }

    // 3. Collect menu modules
    if (mod.menuModules) {
      allMenuModules.push(...mod.menuModules);
    }

    // 4. Collect permissions
    if (mod.permissions) {
      mod.permissions.forEach((p) => allPermissions.add(p));
    }
  }

  // Merge all menu modules into the navigation store
  const navigationStore = useEafNavigationStore();
  const merged: EafMenuModule[] = [];

  for (const mod of allMenuModules) {
    const existing = merged.find((m) => m.name === mod.name);
    if (existing) {
      // Merge items into existing module
      existing.items.push(...mod.items);
    } else {
      merged.push({ ...mod, items: [...mod.items] });
    }
  }

  navigationStore.setMenuModules(merged);

  // Store module registration metadata for diagnostics
  const modulePermissionsMap: Record<string, string[]> = {};
  for (const mod of modules) {
    if (mod.permissions) {
      modulePermissionsMap[mod.id] = [...mod.permissions];
    } else {
      modulePermissionsMap[mod.id] = [];
    }
  }

  navigationStore.setModuleRegistrationInfo({
    moduleIds,
    modulePermissions: modulePermissionsMap,
    registeredPermissions: Array.from(allPermissions),
  });

  return {
    routes: allRoutes,
    menuModules: merged,
    permissions: Array.from(allPermissions),
    moduleIds,
  };
}
