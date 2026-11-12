import { defineStore } from "pinia";
import { computed, inject, ref, toRaw, watch } from "vue";
import type { Composer } from "vue-i18n";
import {
  USER_PREFERENCES_SERVICE_KEY,
  type UserPreferences,
} from "../services/interfaces";
import { createDefaultUserPreferencesService } from "../services/defaultUserPreferencesService";
import { getEafI18n } from "../composables/createEafI18n";
import { useAuthStore } from "./useAuthStore";
import { useLayoutStore } from "./useLayoutStore";

export const useUserPreferencesStore = defineStore("user-preferences", () => {
  const service =
    inject(USER_PREFERENCES_SERVICE_KEY, undefined) ??
    createDefaultUserPreferencesService();
  const auth = useAuthStore();
  const layout = useLayoutStore();
  const i18n = getEafI18n()?.global as unknown as Composer | undefined;

  const preferences = ref<UserPreferences>({});
  const loading = ref(false);

  watch(
    () => auth.user,
    async (user) => {
      preferences.value = {};
      loading.value = !!user;
      if (!user) return;
      try {
        const loaded = await service.get();
        // A later login/logout wins over this one's late answer
        if (auth.user !== user) return;
        preferences.value = loaded;
        if (loaded.darkMode !== undefined) layout.setDarkMode(loaded.darkMode);
        if (loaded.language && i18n?.availableLocales.includes(loaded.language))
          i18n.locale.value = loaded.language;
      } finally {
        if (auth.user === user) loading.value = false;
      }
    },
    { immediate: true },
  );

  watch(
    () => layout.darkMode,
    (darkMode) => update({ darkMode }),
  );

  watch(
    () => i18n?.locale.value,
    (language) => update({ language }),
  );

  let queue: Promise<unknown> = Promise.resolve();

  function update(changes: UserPreferences) {
    if (!auth.user || loading.value) return;
    const current = preferences.value;
    const next = { ...current, ...changes };
    if (
      next.darkMode === current.darkMode &&
      next.language === current.language &&
      next.pinnedPages === current.pinnedPages
    )
      return;
    preferences.value = next;

    const user = auth.user;
    queue = queue
      .then(async () => {
        // Logged out, or someone else, since the change: not theirs to save
        if (auth.user !== user) return;
        await service.save(toRaw(preferences.value));
      })
      // Not saved: the next change brings it along
      .catch(() => {});
  }

  const pinnedPages = computed(() => preferences.value.pinnedPages ?? []);

  function togglePin(path: string) {
    update({
      pinnedPages: pinnedPages.value.includes(path)
        ? pinnedPages.value.filter((p) => p !== path)
        : [...pinnedPages.value, path],
    });
  }

  return {
    preferences,
    loading,
    pinnedPages,
    togglePin,
  };
});
