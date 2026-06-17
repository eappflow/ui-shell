import { inject, type InjectionKey } from "vue";
import { useLayoutStore } from "../stores/useLayoutStore";
import type { ThemeColorName } from "../types";

export interface LayoutContext {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  primaryColor: ThemeColorName;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  setPrimaryColor: (color: ThemeColorName) => void;
}

export const LAYOUT_KEY: InjectionKey<LayoutContext> = Symbol("layout");

export function useEafLayout(): LayoutContext {
  const store = useLayoutStore();
  const injected = inject<LayoutContext | null>(LAYOUT_KEY, null);

  if (injected) {
    return injected;
  }

  return {
    sidebarCollapsed: store.sidebarCollapsed,
    darkMode: store.darkMode,
    primaryColor: store.primaryColor,
    toggleSidebar: store.toggleSidebar,
    setSidebarCollapsed: store.setSidebarCollapsed,
    toggleDarkMode: store.toggleDarkMode,
    setDarkMode: store.setDarkMode,
    setPrimaryColor: store.setPrimaryColor,
  };
}
