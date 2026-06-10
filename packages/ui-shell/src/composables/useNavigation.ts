import { inject, type InjectionKey } from "vue";
import { useNavigationStore } from "../stores/useNavigationStore";
import type { NavigationItem } from "../types";

export interface NavigationContext {
  items: NavigationItem[];
  setItems: (items: NavigationItem[]) => void;
}

export const NAVIGATION_KEY: InjectionKey<NavigationContext> = Symbol("navigation");

export function useNavigation(): NavigationContext {
  const store = useNavigationStore();
  const injected = inject<NavigationContext | null>(NAVIGATION_KEY, null);

  if (injected) {
    return injected;
  }

  return {
    items: store.items,
    setItems: store.setItems,
  };
}