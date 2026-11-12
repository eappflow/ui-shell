<script setup lang="ts">
import { computed, inject } from "vue";
import { useRouter } from "vue-router";
import { APP_CONFIG_KEY } from "../services/interfaces";
import { useEafAuth } from "../composables/useEafAuth";
import { useEafNavigation } from "../composables/useEafNavigation";
import { filterVisibleMenuModules } from "../utils/permissions";

interface Props {
  showAppName: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  navigate: [];
}>();

const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });
const router = useRouter();
const auth = useEafAuth();
const navigation = useEafNavigation();

// The first page the user may open, in the order the modules declare them
const homePath = computed(
  () =>
    filterVisibleMenuModules(navigation.menuModules, auth.userPermissions)[0]
      ?.items[0]?.path,
);

function goHome(): void {
  if (!homePath.value) return;
  router.push(homePath.value);
  emit("navigate");
}
</script>

<template>
  <component
    :is="homePath ? 'a' : 'div'"
    :href="homePath"
    :aria-label="homePath ? appConfig.name : undefined"
    :class="['flex items-center gap-2.5', homePath && 'cursor-pointer']"
    @click.prevent="goHome"
  >
    <component
      :is="appConfig.authorized?.logo"
      v-if="appConfig.authorized?.logo"
    />
    <span
      v-if="showAppName"
      class="text-base text-eaf-ink font-bold tracking-wide truncate"
    >
      {{ appConfig.name }}
    </span>
  </component>
</template>
