<script setup lang="ts">
import { useEafLayout } from "../../composables/useEafLayout";
import ToggleSwitch from "primevue/toggleswitch";
import { computed } from "vue";
import { useScopedI18n } from "../../composables/useScopedI18n";

interface Props {
  withLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  withLabel: false,
});

const layout = useEafLayout();
const darkMode = computed({
  get: () => layout.darkMode,
  set: (enabled: boolean) => layout.setDarkMode(enabled),
});
const { t } = useScopedI18n();
</script>
<template>
  <div class="flex justify-between items-center gap-4 w-fit">
    <div class="flex items-center gap-1">
      <i
        :class="darkMode ? 'pi pi-moon' : 'pi pi-sun'"
        class="text-surface-600 dark:text-surface-200"
        aria-hidden="true"
      />
      <span v-if="props.withLabel" class="ml-2">
        {{
          darkMode
            ? t("dark_mode", "Dark Mode", "Tryb ciemny")
            : t("light_mode", "Light Mode", "Tryb jasny")
        }}
      </span>
    </div>
    <ToggleSwitch
      v-model="darkMode"
      input-id="login-dark-mode"
      aria-label="Toggle dark mode"
    />
  </div>
</template>
