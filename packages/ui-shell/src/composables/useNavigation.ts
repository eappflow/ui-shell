import { inject, type InjectionKey } from "vue";
import { useNavigationStore } from "../stores/useNavigationStore";
import type { MenuModule } from "../types";

export interface NavigationContext {
  menuModules: MenuModule[];
  setMenuModules: (modules: MenuModule[]) => void;
}

export const NAVIGATION_KEY: InjectionKey<NavigationContext> = Symbol("navigation");

export function useNavigation(): NavigationContext {
  const store = useNavigationStore();
  const injected = inject<NavigationContext | null>(NAVIGATION_KEY, null);

  if (injected) {
    return injected;
  }

  return {
    menuModules: store.menuModules,
    setMenuModules: store.setMenuModules,
  };
}