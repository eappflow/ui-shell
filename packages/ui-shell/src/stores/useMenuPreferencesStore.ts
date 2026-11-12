import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";
import { STORAGE_KEYS } from "../utils/constants";

/** Per-browser menu choices, pinned pages by path, collapsed groups by name */
export const useMenuPreferencesStore = defineStore("menu-preferences", () => {
  const pinnedPages = useLocalStorage<string[]>(
    STORAGE_KEYS.MENU_PINNED_PAGES,
    [],
  );
  const collapsedGroups = useLocalStorage<string[]>(
    STORAGE_KEYS.MENU_COLLAPSED_GROUPS,
    [],
  );

  function toggle(list: { value: string[] }, group: string) {
    list.value = list.value.includes(group)
      ? list.value.filter((g) => g !== group)
      : [...list.value, group];
  }

  return {
    pinnedPages,
    collapsedGroups,
    isPinned: (group: string) => pinnedPages.value.includes(group),
    togglePin: (group: string) => toggle(pinnedPages, group),
    isCollapsed: (group: string) => collapsedGroups.value.includes(group),
    toggleGroup: (group: string) => toggle(collapsedGroups, group),
  };
});
