import { defineStore } from "pinia";
import { computed, ref, shallowReactive, shallowRef, watch } from "vue";
import type { EafMenuItem, EafMenuModule, EafMenuSource } from "../types";
import { filterPermitted } from "../utils/permissions";
import { useAuthStore } from "./useAuthStore";

export const useEafNavigationStore = defineStore("eaf-navigation", () => {
  const auth = useAuthStore();

  const staticMenuModules = ref<EafMenuModule[]>([]);
  // Shallow: a module reloads a source by the object it registered, not a proxy of it
  const menuSources = shallowRef<{ moduleId: string; source: EafMenuSource }[]>(
    [],
  );
  const sourceItems = shallowReactive(new Map<EafMenuSource, EafMenuItem[]>());
  const loadingSources = shallowReactive(new Set<EafMenuSource>());
  // A newer load of a source makes the older one's answer stale
  const loadVersions = new Map<EafMenuSource, number>();

  /** The modules' groups, each followed by the items of its sources */
  const menuModules = computed(() =>
    staticMenuModules.value.map((group) => {
      const loaded = menuSources.value
        .filter(({ source }) => source.group === group.name)
        .flatMap(({ moduleId, source }) =>
          (sourceItems.get(source) ?? []).map((item) =>
            item.nameKey
              ? { ...item, nameKey: `menu.${moduleId}.${item.nameKey}` }
              : item,
          ),
        );
      return loaded.length
        ? { ...group, items: [...group.items, ...loaded] }
        : group;
    }),
  );

  const loadingMenuSources = computed(() => loadingSources.size > 0);

  /** IDs of all registered eAppFlow modules */
  const moduleIds = ref<string[]>([]);

  /** Permissions declared by each module (moduleId → Permission[]) */
  const modulePermissions = ref<Record<string, string[]>>({});

  /** All declared permissions (deduplicated) */
  const registeredPermissions = ref<string[]>([]);

  function setMenuModules(modules: EafMenuModule[]) {
    staticMenuModules.value = modules;
  }

  function setMenuSources(
    sources: { moduleId: string; source: EafMenuSource }[],
  ) {
    menuSources.value = sources;
  }

  async function load(source: EafMenuSource): Promise<void> {
    const version = (loadVersions.get(source) ?? 0) + 1;
    loadVersions.set(source, version);
    const isCurrent = () => loadVersions.get(source) === version;

    if (
      !auth.user ||
      filterPermitted([source], auth.userPermissions).length === 0
    ) {
      sourceItems.delete(source);
      loadingSources.delete(source);
      return;
    }

    loadingSources.add(source);
    try {
      const items = await source.load();
      if (isCurrent()) sourceItems.set(source, items);
    } finally {
      if (isCurrent()) loadingSources.delete(source);
    }
  }

  async function reloadMenuSource(source: EafMenuSource): Promise<void> {
    if (!menuSources.value.some((entry) => entry.source === source)) {
      throw new Error(
        "[ui-shell] reloadMenuSource: the source isn't in any module's menuSources",
      );
    }
    await load(source);
  }

  watch([() => auth.user, menuSources], ([user], [previous]) => {
    // Someone else's items never show, not even until the new user's arrive
    if (user?.id !== previous?.id) sourceItems.clear();
    return Promise.all(menuSources.value.map(({ source }) => load(source)));
  });

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
    loadingMenuSources,
    moduleIds,
    modulePermissions,
    registeredPermissions,
    setMenuModules,
    setMenuSources,
    reloadMenuSource,
    setModuleRegistrationInfo,
  };
});
