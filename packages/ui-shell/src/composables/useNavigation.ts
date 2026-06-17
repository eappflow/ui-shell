import { inject, type InjectionKey } from "vue";
import { useEafNavigationStore } from "@eappflow/ui-shell-core";
import type { EafMenuModule } from "@eappflow/ui-shell-core";

export interface NavigationContext {
  menuModules: EafMenuModule[];
  setMenuModules: (modules: EafMenuModule[]) => void;
}

export const NAVIGATION_KEY: InjectionKey<NavigationContext> = Symbol("navigation");

export function useNavigation(): NavigationContext {
  const store = useEafNavigationStore();
  const injected = inject<NavigationContext | null>(NAVIGATION_KEY, null);

  if (injected) {
    return injected;
  }

  return {
    menuModules: store.menuModules,
    setMenuModules: store.setMenuModules,
  };
}