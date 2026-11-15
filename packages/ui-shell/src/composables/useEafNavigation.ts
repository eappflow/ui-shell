import { inject, type InjectionKey } from "vue";
import { useEafNavigationStore } from "../stores/useEafNavigationStore";
import type { EafMenuModule, EafMenuSource } from "../types";

export interface EafNavigationContext {
  /** The menu, with the items its sources loaded for the signed-in user */
  menuModules: EafMenuModule[];
  /** Some menu source is loading its items */
  loadingMenuSources: boolean;
  moduleIds: string[];
  modulePermissions: Record<string, string[]>;
  registeredPermissions: string[];
  setMenuModules: (modules: EafMenuModule[]) => void;
  /** Loads the source's items again, e.g. after one of them was renamed */
  reloadMenuSource: (source: EafMenuSource) => Promise<void>;
}

export const EAF_NAVIGATION_KEY: InjectionKey<EafNavigationContext> =
  Symbol("eaf-navigation");

export function useEafNavigation(): EafNavigationContext {
  const store = useEafNavigationStore();
  const injected = inject<EafNavigationContext | null>(
    EAF_NAVIGATION_KEY,
    null,
  );

  if (injected) {
    return injected;
  }

  return {
    get menuModules() {
      return store.menuModules;
    },
    get loadingMenuSources() {
      return store.loadingMenuSources;
    },
    get moduleIds() {
      return store.moduleIds;
    },
    get modulePermissions() {
      return store.modulePermissions;
    },
    get registeredPermissions() {
      return store.registeredPermissions;
    },
    setMenuModules: store.setMenuModules,
    reloadMenuSource: store.reloadMenuSource,
  };
}
