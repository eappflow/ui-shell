/**
 * Plugin registry — merges contributions from all registered plugins.
 *
 * Call `configurePlugins()` at app bootstrap to register all plugins,
 * collect their routes, menu modules and permissions, then wire them
 * into the shell.
 */

import type { App } from "vue";
import type { Router } from "vue-router";
import { useNavigationStore } from "../stores/useNavigationStore";
import type { EafPlugin, PluginRegistrationResult, MenuModule } from "../types";

/**
 * Register a list of plugins with the shell.
 *
 * For each plugin:
 *  1. Calls `plugin.install(app, config)` if the hook is defined
 *  2. Collects routes, menu modules and permissions
 *
 * After all plugins are processed, merges all menu modules
 * and sets them on the navigation store.
 *
 * @param plugins - Array of plugin instances
 * @param app     - Vue application instance
 * @param router  - Vue Router instance
 * @returns       - Aggregated result with all routes, menus, permissions
 */
export function configurePlugins(
  plugins: EafPlugin[],
  app: App,
  router: Router,
): PluginRegistrationResult {
  const allRoutes: PluginRegistrationResult["routes"] = [];
  const allMenuModules: PluginRegistrationResult["menuModules"] = [];
  const allPermissions = new Set<string>();
  const pluginIds: string[] = [];

  for (const plugin of plugins) {
    pluginIds.push(plugin.id);

    // 1. Install hook
    if (typeof plugin.install === "function") {
      plugin.install(app);
    }

    // 2. Collect routes
    if (plugin.routes) {
      for (const route of plugin.routes) {
        // Tag route with plugin id for traceability
        const meta = { ...route.meta, pluginId: plugin.id };
        allRoutes.push({ ...route, meta });
      }
    }

    // 3. Collect menu modules
    if (plugin.menuModules) {
      allMenuModules.push(...plugin.menuModules);
    }

    // 4. Collect permissions
    if (plugin.permissions) {
      plugin.permissions.forEach((p) => allPermissions.add(p));
    }
  }

  // Merge all menu modules into the navigation store
  const navigationStore = useNavigationStore();
  const merged: MenuModule[] = [];

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

  return {
    routes: allRoutes,
    menuModules: merged,
    permissions: Array.from(allPermissions),
    pluginIds,
  };
}