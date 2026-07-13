<script setup lang="ts">
import { ref, computed, inject } from "vue";
import { useRouter } from "vue-router";
import Card from "primevue/card";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
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
import { useScopedI18n } from "../i18n";

const router = useRouter();
const authStore = useAuthStore();
const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });
const { t } = useScopedI18n();

const $f = useEafFormValidation();
const email = ref("");
const loading = ref(false);
const success = ref(false);

const uiCard = computed(() => appConfig.classes?.ui?.card);
const uiButton = computed(() => appConfig.classes?.ui?.button);
const uiInput = computed(() => appConfig.classes?.ui?.input);
const uiLabel = computed(() => appConfig.classes?.ui?.label);

function validateForm(): boolean {
  $f.clearErrors();
  let isValid = true;
  if (!email.value.trim()) {
    $f.setFieldError("email", "Email address is required");
    isValid = false;
  }
  return isValid;
}

async function handleRestorePassword(): Promise<void> {
  if (!validateForm()) return;
  loading.value = true;
  try {
    await authStore.restorePassword(email.value);
    success.value = true;
  } catch (error: unknown) {
    $f.handleApiError(error);
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  router.push("/login");
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
        <h1 :class="['eaf-reset-password-title', uiCard?.title]">
          {{ t("reset_password", "Reset Password", "Resetuj hasło") }}
        </h1>
      </div>
    </template>
    <template #subtitle>
      <span :class="[uiCard?.subtitle]">
        {{
          t(
            "enter_email",
            "Enter your email to receive password reset instructions",
            "Wprowadź swój email, aby otrzymać instrukcje resetowania hasła",
          )
        }}
      </span>
    </template>
    <template #content>
      <form
        v-if="!success"
        class="flex flex-col gap-5"
        @submit.prevent="handleRestorePassword"
      >
        <EafFormValidationSummary :form="$f" />

        <EafFormItem
          field="email"
          :label="t('email', 'Email', 'Email')"
          :form="$f"
          :required="true"
          :label-class="uiLabel"
        >
          <IconField :class="[uiInput]">
            <InputIcon class="pi pi-envelope" />
            <InputText
              v-model="email"
              type="email"
              :placeholder="
                t('enter_email', 'Enter your email', 'Wprowadź swój email')
              "
              :disabled="loading"
              class="w-full"
              autocomplete="email"
            />
          </IconField>
        </EafFormItem>

        <Button
          type="submit"
          :label="
            t('send_reset_link', 'Send Reset Link', 'Wyślij link resetujący')
          "
          :loading="loading"
          :class="['w-full', uiButton]"
          size="large"
        />

        <div class="text-center">
          <Button
            :label="t('back_to_login', 'Back to Login', 'Wróć do logowania')"
            link
            :disabled="loading"
            @click="goToLogin"
          />
        </div>
      </form>

      <div v-else class="flex flex-col gap-5">
        <Message severity="success" :closable="false">
          {{
            t(
              "reset_instructions_sent",
              "Password reset instructions have been sent to your email address.",
              "Instrukcje resetowania hasła zostały wysłane na Twój adres email.",
            )
          }}
        </Message>
        <p class="text-sm text-surface-600">
          {{
            t(
              "reset_link_validity",
              "If the email exists, a password reset link has been sent. The link will expire in 2 days.",
              "Jeśli adres e-mail istnieje, wysłano link do resetowania hasła. Link wygaśnie za 2 dni.",
            )
          }}
        </p>
        <Button
          :label="t('back_to_login', 'Back to login', 'Powrót do logowania')"
          :class="['w-full', uiButton]"
          size="large"
          @click="goToLogin"
        />
      </div>
    </template>
  </Card>
</template>

<style>
@layer eaf-shell {
  .eaf-reset-password-title {
    font-weight: 600;
    font-size: 1.75rem;
  }
}
</style>
