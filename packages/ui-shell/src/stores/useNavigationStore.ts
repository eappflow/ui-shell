import { defineStore } from "pinia";
import { ref } from "vue";
import type { MenuItem, MenuModule } from "../types";

export const useNavigationStore = defineStore("navigation", () => {
  const menuModules = ref<MenuModule[]>([]);

  function setMenuModules(modules: MenuModule[]) {
    menuModules.value = modules;
  }

  return { menuModules, setMenuModules };
});