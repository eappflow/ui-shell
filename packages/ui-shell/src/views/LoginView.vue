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
  EafFormItem,
  EafFormValidationSummary,
  useEafForm,
} from "@eappflow/ui-shell-components";
import { LogoPlacement } from "../types/eaf-logo";
import AppLogo from "../components/AppLogo.vue";
import { useScopedI18n } from "../composables/useScopedI18n";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });
const { t } = useScopedI18n();

const $f = useEafForm({
  data: {
    login: "",
    password: "",
    age: 0,
  },
  rules: {
    login: {
      required: {
        message: t(
          "login_required",
          "Login is required",
          "Login jest wymagany",
        ),
      },
    },
    password: {
      required: {
        message: t(
          "password_required",
          "Password is required",
          "Hasło jest wymagane",
        ),
      },
    },
  },
});
const loadingSSO = ref(false);
const loading = computed(() => $f.loading.value || loadingSSO.value);

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

async function handleLogin(): Promise<void> {
  $f.submit(async ({ login, password }) => {
    await authStore.login(login, password);
    router.push(redirectUrl.value);
  });
}

async function handleLoginWithMicrosoftSSO(): Promise<void> {
  loadingSSO.value = true;
  try {
    // It should redirect to Microsoft login page, so we don't need to handle the result here
    await authStore.loginWithMicrosoftSSO(redirectUrl.value);
  } catch {
    // Already parsed and shown via the shared validation banner in useAuthStore.
  } finally {
    loadingSSO.value = false;
  }
}
</script>

<template>
  <Card>
    <template #title>
      <h1>
        {{ t("login", "Login", "Zaloguj się") }}
      </h1>
    </template>
    <template #content>
      <form class="flex flex-col gap-5 mt-5" @submit.prevent="handleLogin">
        <EafFormValidationSummary :form="$f" />

        <EafFormItem for="login" :label="t('login', 'Login', 'Login')" :form="$f" :required="true"
          :label-class="uiLabel">
          <IconField :class="[uiInput]">
            <InputIcon class="pi pi-user" />
            <InputText v-model="$f.data.login" data-testid="login-input" :placeholder="t('enter_login', 'Enter your login', 'Wprowadź swój login')
              " :disabled="loading" class="w-full" autocomplete="username" />
          </IconField>
        </EafFormItem>

        <EafFormItem for="password" :label="t('password', 'Password', 'Hasło')" :form="$f" :required="true"
          :label-class="uiLabel">
          <IconField>
            <InputIcon class="pi pi-lock" />
            <Password v-model="$f.data.password" :placeholder="t(
              'enter_password',
              'Enter your password',
              'Wprowadź swoje hasło',
            )
              " :disabled="loading" :feedback="false" toggle-mask class="w-full" input-class="w-full"
              autocomplete="current-password" :pt="{
                pcInputText: { root: { 'data-testid': 'password-input' } },
              }" />
          </IconField>
        </EafFormItem>

        <div class="text-right">
          <router-link to="/restore-password" class="text-sm text-primary hover:underline">
            {{ t("recover_password", "Recover password", "Odzyskaj hasło") }}
          </router-link>
        </div>

        <Button type="submit" data-testid="login-button" :label="t('login', 'Login', 'Login')" :loading="loading"
          :class="['w-full', uiButton]" size="large" />
        <Button v-if="authStore.isUsingMicrosoftSSO" type="button" variant="outlined"
          data-testid="login-microsoft-sso-button" :label="t(
            'login_with_microsoft',
            'Login with Microsoft',
            'Zaloguj się za pomocą Microsoft',
          )
            " :loading="loading" :class="['w-full', uiButton]" size="large" @click="handleLoginWithMicrosoftSSO" />
      </form>
    </template>
  </Card>
</template>
