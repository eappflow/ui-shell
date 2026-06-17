import { defineStore } from "pinia";
import { ref } from "vue";
import type { EafMenuModule } from "../types";

export const useEafNavigationStore = defineStore("eaf-navigation", () => {
  const menuModules = ref<EafMenuModule[]>([]);

  /** IDs of all registered eAppFlow modules */
  const moduleIds = ref<string[]>([]);

  /** Permissions declared by each module (moduleId → Permission[]) */
  const modulePermissions = ref<Record<string, string[]>>({});

  /** All declared permissions (deduplicated) */
  const registeredPermissions = ref<string[]>([]);

  function setMenuModules(modules: EafMenuModule[]) {
    menuModules.value = modules;
  }

  function setModuleRegistrationInfo(info: {
    moduleIds: string[];
    modulePermissions: Record<string, string[]>;
    registeredPermissions: string[];
  }) {
    moduleIds.value = info.moduleIds;
    modulePermissions.value = info.modulePermissions;
    registeredPermissions.value = info.registeredPermissions;
  }

  return {
    menuModules,
    moduleIds,
    modulePermissions,
    registeredPermissions,
    setMenuModules,
    setModuleRegistrationInfo,
  };
});
