import { defineStore } from "pinia";
import { ref } from "vue";

export const useLayoutStore = defineStore("layout", () => {
  const sidebarCollapsed = ref(false);
  const theme = ref<"light" | "dark">("light");

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function setTheme(newTheme: "light" | "dark") {
    theme.value = newTheme;
  }

  return { sidebarCollapsed, theme, toggleSidebar, setTheme };
});