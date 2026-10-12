<script setup lang="ts">
import { useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import Popover from "primevue/popover";
import DarkModeToggle from "./ui/DarkModeToggle.vue";
import ThemeColorPicker from "./ui/ThemeColorPicker.vue";
import LanguageSelect from "./ui/LanguageSelect.vue";
import { useEafAuth } from "../composables/useEafAuth";
import { useScopedI18n } from "../composables/useScopedI18n";

const emit = defineEmits<{
  logout: [];
}>();

const router = useRouter();
const auth = useEafAuth();
const { t } = useScopedI18n();

const panel = useTemplateRef<InstanceType<typeof Popover>>("panel");
</script>

<template>
  <Button
    icon="pi pi-user"
    class="p-0 h-8 w-8"
    data-testid="account-menu-button"
    text
    rounded
    aria-label="Account"
    @click="panel?.toggle($event)"
  />

  <Popover ref="panel" data-testid="account-menu-panel">
    <div class="flex w-60 flex-col gap-1">
      <div class="flex items-center gap-2 px-3 py-2 text-sm font-medium">
        <span class="pi pi-user" />
        <span>{{ auth.userName || "User" }}</span>
      </div>

      <hr class="my-1 border-surface-200 dark:border-surface-700" />

      <div class="px-3 py-1">
        <DarkModeToggle with-label class="w-full" />
      </div>

      <ThemeColorPicker class="px-3 py-2" />

      <LanguageSelect with-label class="px-3 py-2" />

      <hr class="my-1 border-surface-200 dark:border-surface-700" />

      <button
        type="button"
        class="flex items-center gap-2 px-3 py-2 text-sm text-left rounded cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"
        @click="router.push('/change-password')"
      >
        <span class="pi pi-key" />
        <span>{{
          t("change_password", "Change Password", "Zmień hasło")
        }}</span>
      </button>
      <button
        type="button"
        data-testid="logout-menu-item"
        class="flex items-center gap-2 px-3 py-2 text-sm text-left rounded cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800"
        @click="emit('logout')"
      >
        <span class="pi pi-sign-out" />
        <span>{{ t("logout", "Logout", "Wyloguj") }}</span>
      </button>
    </div>
  </Popover>
</template>
