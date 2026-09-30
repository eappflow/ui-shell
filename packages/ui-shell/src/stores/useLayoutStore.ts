import { defineStore } from "pinia";
import { ref, inject } from "vue";
import { useLocalStorage } from "@vueuse/core";
import {
  APP_CONFIG_KEY,
  THEME_SERVICE_KEY,
  type ThemeService,
} from "../services/interfaces";
import { createDefaultThemeService } from "../services/defaultThemeService";
import { STORAGE_KEYS } from "../utils/constants";

export const useLayoutStore = defineStore("layout", () => {
  const themeConfig = inject(APP_CONFIG_KEY, undefined)?.theme;
  const themeService: ThemeService =
    inject(THEME_SERVICE_KEY, undefined) ??
    createDefaultThemeService(themeConfig);

  const availableColors = themeConfig?.colors ?? [];

  const settings = themeService.getSettings();

  const sidebarCollapsed = useLocalStorage(
    STORAGE_KEYS.SIDEBAR_COLLAPSED,
    false,
  );
  const darkMode = ref(settings.darkMode);
  const primaryColor = ref(settings.primaryColor);

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed;
  }

  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    applyTheme();
  }

  function setDarkMode(enabled: boolean) {
    darkMode.value = enabled;
    applyTheme();
  }

  function setPrimaryColor(color: typeof primaryColor.value) {
    primaryColor.value = color;
    applyTheme();
  }

  function applyTheme() {
    themeService.saveSettings({
      darkMode: darkMode.value,
      primaryColor: primaryColor.value,
    });
    themeService.applyTheme({
      darkMode: darkMode.value,
      primaryColor: primaryColor.value,
    });
  }

  // Apply saved theme on creation
  applyTheme();

  // Listen for system theme changes
  if (typeof window !== "undefined" && window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (localStorage.getItem("theme_dark_mode") === null) {
          darkMode.value = e.matches;
          applyTheme();
        }
      });
  }

  return {
    sidebarCollapsed,
    darkMode,
    primaryColor,
    availableColors,
    toggleSidebar,
    setSidebarCollapsed,
    toggleDarkMode,
    setDarkMode,
    setPrimaryColor,
    applyTheme,
  };
});
