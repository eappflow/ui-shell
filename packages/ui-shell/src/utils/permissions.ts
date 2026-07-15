import { EafFilteredMenuModule, EafMenuItem, EafMenuModule } from "../types";

/**
 * Check if user has any of the required permissions.
 */
export function hasAnyPermission(
  userPermissions: string[],
  required: string[],
): boolean {
  return required.some((permission) => userPermissions.includes(permission));
}

/**
 * Evaluate if a menu item should be visible based on permissions and custom logic.
 */
export function isMenuItemVisible(
  item: EafMenuItem,
  userPermissions: string[],
): boolean {
  if (item.isVisible) {
    return item.isVisible(userPermissions);
  }
  if (item.permissions && item.permissions.length > 0) {
    return hasAnyPermission(userPermissions, item.permissions);
  }
  return true;
}

/**
 * Filter menu items to only include visible ones.
 */
export function filterVisibleMenuItems(
  items: EafMenuItem[],
  userPermissions: string[],
): EafMenuItem[] {
  return items.filter((item) => isMenuItemVisible(item, userPermissions));
}

/**
 * Filter menu modules to only include modules with at least one visible item.
 * Modules with no visible children are completely removed.
 */
export function filterVisibleMenuModules(
  modules: EafMenuModule[],
  userPermissions: string[],
): EafFilteredMenuModule[] {
  const filtered: EafFilteredMenuModule[] = [];

  for (const module of modules) {
    const visibleItems = filterVisibleMenuItems(module.items, userPermissions);

    if (visibleItems.length > 0) {
      if (module.isVisible && !module.isVisible(userPermissions)) {
        continue;
      }
      filtered.push({
        name: module.name,
        nameKey: module.nameKey,
        icon: module.icon,
        items: visibleItems,
      });
    }
  }

  return filtered;
}
