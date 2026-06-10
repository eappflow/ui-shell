import { inject, type InjectionKey } from "vue";
import { useLayoutStore } from "../stores/useLayoutStore";

export interface LayoutContext {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const LAYOUT_KEY: InjectionKey<LayoutContext> = Symbol("layout");

export function useLayout(): LayoutContext {
  const store = useLayoutStore();
  const injected = inject<LayoutContext | null>(LAYOUT_KEY, null);

  if (injected) {
    return injected;
  }

  return {
    sidebarCollapsed: store.sidebarCollapsed,
    theme: store.theme,
    toggleSidebar: store.toggleSidebar,
    setTheme: store.setTheme,
  };
}