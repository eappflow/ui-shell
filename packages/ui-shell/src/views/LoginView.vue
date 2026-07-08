<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { useRouter, useRoute } from "vue-router";
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useAuthStore } from "../stores/useAuthStore";
import { APP_CONFIG_KEY } from "../services/interfaces";
import {
  useEafFormValidation,
  EafFormItem,
  EafFormValidationSummary,
} from "@eappflow/ui-shell-components";
import { LogoPlacement } from "../types/eaf-logo";
import AppLogo from "../components/AppLogo.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

const $f = useEafFormValidation();
const login = ref("");
const password = ref("");
const loading = ref(false);

const uiCard = computed(() => appConfig.classes?.ui?.card);
const uiButton = computed(() => appConfig.classes?.ui?.button);
const uiInput = computed(() => appConfig.classes?.ui?.input);
const uiLabel = computed(() => appConfig.classes?.ui?.label);

const redirectUrl = computed(() => {
  const redirect = route.query.redirect as string | undefined;
  if (redirect && typeof redirect === "string" && redirect.startsWith("/")) {
    return redirect;
  }
  return "/";
});

function validateForm(): boolean {
  $f.clearErrors();
  let isValid = true;
  if (!login.value.trim()) {
    $f.setFieldError("login", "Login is required");
    isValid = false;
  }
  if (!password.value) {
    $f.setFieldError("password", "Password is required");
    isValid = false;
  }
  return isValid;
}

async function handleLogin(): Promise<void> {
  if (!validateForm()) return;
  loading.value = true;
  try {
    await authStore.login(login.value, password.value);
    router.push(redirectUrl.value);
  } catch (error: unknown) {
    $f.handleApiError(error);
  } finally {
    loading.value = false;
  }
}

async function handleLoginWithMicrosoftSSO(): Promise<void> {
  loading.value = true;
  try {
    await authStore.loginWithMicrosoftSSO(redirectUrl.value);
  } catch (error: unknown) {
    $f.handleApiError(error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <Card :class="[uiCard?.root]">
    <template #title>
      <div
        class="flex gap-4 justify-center mb-5 pb-3 border-b-1 border-surface-200"
      >
        <AppLogo
          class-image="max-h-18"
          :show-app-name="false"
          :placement="LogoPlacement.UNAUTHORIZED_LAYOUT_COMPONENTS"
        />
      </div>
      <div class="mb-5">
        <h1 :class="['eaf-login-title', uiCard?.title]">Login</h1>
      </div>
    </template>
    <template #subtitle>
      <span :class="[uiCard?.subtitle]">
        Enter your credentials to access the portal
      </span>
    </template>
    <template #content>
      <form class="flex flex-col gap-5" @submit.prevent="handleLogin">
        <EafFormValidationSummary :form="$f" />

        <EafFormItem
          field="login"
          label="Login"
          :form="$f"
          :required="true"
          :label-class="uiLabel"
        >
          <IconField :class="[uiInput]">
            <InputIcon class="pi pi-user" />
            <InputText
              v-model="login"
              placeholder="Enter your login"
              :disabled="loading"
              class="w-full"
              autocomplete="username"
            />
          </IconField>
        </EafFormItem>

        <EafFormItem
          field="password"
          label="Password"
          :form="$f"
          :required="true"
          :label-class="uiLabel"
        >
          <IconField :class="[uiInput]">
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="password"
              placeholder="Enter your password"
              :disabled="loading"
              :feedback="false"
              toggle-mask
              class="w-full"
              input-class="w-full"
              autocomplete="current-password"
            />
          </IconField>
        </EafFormItem>

        <div class="text-right">
          <router-link
            to="/restore-password"
            class="text-sm text-primary hover:underline"
          >
            Recover password
          </router-link>
        </div>

        <Button
          type="submit"
          label="Login"
          :loading="loading"
          :class="['w-full', uiButton]"
          size="large"
        />
        <Button
          v-if="authStore.isUsingMicrosoftSSO"
          type="button"
          label="Login with Microsoft"
          :loading="loading"
          :class="['w-full', uiButton]"
          size="large"
          @click="handleLoginWithMicrosoftSSO"
        />
      </form>
    </template>
  </Card>
</template>

<style>
@layer eaf-shell {
  .eaf-login-title {
    font-weight: 600;
    font-size: 1.75rem;
  }
}
</style>
