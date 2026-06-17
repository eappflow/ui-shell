import { inject, type InjectionKey } from "vue";
import { useEafNavigationStore } from "../stores/useEafNavigationStore";
import type { EafMenuModule } from "../types";

export interface EafNavigationContext {
  menuModules: EafMenuModule[];
  moduleIds: string[];
  modulePermissions: Record<string, string[]>;
  registeredPermissions: string[];
  setMenuModules: (modules: EafMenuModule[]) => void;
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
    menuModules: store.menuModules,
    moduleIds: store.moduleIds,
    modulePermissions: store.modulePermissions,
    registeredPermissions: store.registeredPermissions,
    setMenuModules: store.setMenuModules,
  };
}
