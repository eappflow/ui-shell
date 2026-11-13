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
  /** Keys of the menu groups the user folded */
  const collapsedMenuGroups = useLocalStorage<string[]>(
    STORAGE_KEYS.MENU_COLLAPSED_GROUPS,
    [],
  );
  const darkMode = ref(settings.darkMode);
  const primaryColor = ref(settings.primaryColor);
  /** The full-page AI chat is open - the layout's chat panel steps aside meanwhile */
  const chatPageOpen = ref(false);
  /** The side chat panel (aside) is open */
  const chatPanelOpen = ref(false);

  function toggleChatPanel() {
    chatPanelOpen.value = !chatPanelOpen.value;
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed;
  }

  function toggleMenuGroup(key: string) {
    collapsedMenuGroups.value = collapsedMenuGroups.value.includes(key)
      ? collapsedMenuGroups.value.filter((k) => k !== key)
      : [...collapsedMenuGroups.value, key];
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
    collapsedMenuGroups,
    darkMode,
    primaryColor,
    availableColors,
    chatPageOpen,
    chatPanelOpen,
    toggleChatPanel,
    toggleSidebar,
    setSidebarCollapsed,
    toggleMenuGroup,
    toggleDarkMode,
    setDarkMode,
    setPrimaryColor,
    applyTheme,
  };
});
