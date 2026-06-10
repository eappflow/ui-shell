import { defineStore } from "pinia";
import { ref } from "vue";
import type { NavigationItem } from "../types";

export const useNavigationStore = defineStore("navigation", () => {
  const items = ref<NavigationItem[]>([]);

  function setItems(newItems: NavigationItem[]) {
    items.value = newItems;
  }

  return { items, setItems };
});