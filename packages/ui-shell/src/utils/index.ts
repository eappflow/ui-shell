// ─── Constants ──────────────────────────────────────────────────────────────
export { SHELL_VERSION, STORAGE_KEYS } from "./constants";

// ─── Event Bus ───────────────────────────────────────────────────────────────
export { eventBus } from "./eventBus";

// ─── Deep Merge ──────────────────────────────────────────────────────────────
export { deepMerge } from "./deepMerge";

// ─── Permissions / Menu Filtering ────────────────────────────────────────────
export {
  hasAnyPermission,
  isMenuItemVisible,
  filterVisibleMenuItems,
  filterVisibleMenuModules,
} from "./permissions";
