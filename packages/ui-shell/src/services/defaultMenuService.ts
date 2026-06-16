import type { MenuService } from './interfaces'
import type { MenuModule } from '../types'

/**
 * Default menu service — returns an empty menu.
 * Host applications should provide their own via DI or use the
 * extended default that accepts a menu configuration array.
 */
export function createDefaultMenuService(): MenuService {
  return {
    getMenu: () => [],
  }
}

/**
 * Create a menu service from a static configuration array.
 * Useful when the menu structure is known at build time,
 * which is the most common case.
 */
export function createStaticMenuService(menu: MenuModule[]): MenuService {
  return {
    getMenu: () => menu,
  }
}