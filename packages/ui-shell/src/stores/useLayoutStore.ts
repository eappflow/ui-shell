import { defineStore } from "pinia";
import { ref, inject } from "vue";
import { THEME_SERVICE_KEY, type ThemeService } from "../services/interfaces";
import { createDefaultThemeService } from "../services/defaultThemeService";

export const useLayoutStore = defineStore("layout", () => {
  const themeService: ThemeService =
    inject(THEME_SERVICE_KEY, undefined) ?? createDefaultThemeService();

  const settings = themeService.getSettings();

  const sidebarCollapsed = ref(false);
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
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
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
    toggleSidebar,
    setSidebarCollapsed,
    toggleDarkMode,
    setDarkMode,
    setPrimaryColor,
    applyTheme,
  };
});