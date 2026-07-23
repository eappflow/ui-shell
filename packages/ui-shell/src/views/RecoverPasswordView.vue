<script setup lang="ts">
import { ref, reactive, computed, inject, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Card from "primevue/card";
import Button from "primevue/button";
import Password from "primevue/password";
import Message from "primevue/message";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { useAuthStore } from "../stores/useAuthStore";
import { APP_CONFIG_KEY } from "../services/interfaces";
import {
  useEafForm,
  EafFormItem,
  EafFormValidationSummary,
} from "@eappflow/ui-shell-components";
import { LogoPlacement } from "../types/eaf-logo";
import AppLogo from "../components/AppLogo.vue";
import { useScopedI18n } from "../composables/useScopedI18n";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });
const { t } = useScopedI18n();

interface RecoverPasswordForm {
  newPassword: string;
  confirmPassword: string;
}
const formData: RecoverPasswordForm = reactive({
  newPassword: "",
  confirmPassword: "",
});

const $f = useEafForm<RecoverPasswordForm>({
  data: formData,
  rules: {
    newPassword: {
      required: { required: true, message: "New password is required." },
    },
    confirmPassword: {
      required: {
        required: true,
        message: "Confirm password is required.",
      },
    },
  },
});
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const success = ref(false);
const token = ref("");
const tokenError = ref("");

const uiCard = computed(() => appConfig.classes?.ui?.card);
const uiButton = computed(() => appConfig.classes?.ui?.button);
const uiInput = computed(() => appConfig.classes?.ui?.input);
const uiLabel = computed(() => appConfig.classes?.ui?.label);

onMounted(() => {
  token.value = route.params.token as string;
  if (!token.value) {
    tokenError.value = "Invalid or missing reset token";
  }
});

function validateForm(): boolean {
  $f.clearErrors();
  let isValid = true;

  if (!newPassword.value) {
    $f.setFieldError("newPassword", "Password is required");
    isValid = false;
  } else if (newPassword.value.length < 6) {
    $f.setFieldError("newPassword", "Password must be at least 6 characters");
    isValid = false;
  }

  if (!confirmPassword.value) {
    $f.setFieldError("confirmPassword", "Please confirm your password");
    isValid = false;
  } else if (newPassword.value !== confirmPassword.value) {
    $f.setFieldError("confirmPassword", "Passwords do not match");
    isValid = false;
  }

  return isValid;
}

async function handleResetPassword(): Promise<void> {
  if (!validateForm()) return;
  loading.value = true;
  try {
    await authStore.recoverPassword(token.value, newPassword.value);
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

function requestNewReset() {
  router.push("/restore-password");
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
        <h1 :class="['eaf-recover-password-title', uiCard?.title]">
          {{
            t("reset_password", "Reset Your Password", "Zresetuj swoje hasło")
          }}
        </h1>
      </div>
    </template>
    <template #subtitle>
      <span :class="[uiCard?.subtitle]">
        {{
          t(
            "enter_new_password",
            "Enter your new password below",
            "Wprowadź swoje nowe hasło poniżej",
          )
        }}
      </span>
    </template>
    <template #content>
      <!-- Token error state -->
      <div v-if="tokenError" class="flex flex-col gap-5">
        <Message severity="error" :closable="false">
          {{ tokenError }}
        </Message>
        <div class="flex flex-col gap-3">
          <Button
            :label="
              t(
                'request_new_reset',
                'Request New Reset Link',
                'Poproś o nowy link resetujący',
              )
            "
            :class="['w-full', uiButton]"
            size="large"
            @click="requestNewReset"
          />
          <Button
            :label="t('back_to_login', 'Back to Login', 'Wróć do logowania')"
            severity="secondary"
            outlined
            :class="['w-full', uiButton]"
            size="large"
            @click="goToLogin"
          />
        </div>
      </div>

      <!-- Form state -->
      <form
        v-else-if="!success && token"
        class="flex flex-col gap-5"
        @submit.prevent="handleResetPassword"
      >
        <EafFormValidationSummary :form="$f" />

        <Message severity="info" :closable="false">
          Password reset links are valid for 2 days and can only be used once.
        </Message>

        <EafFormItem
          for="newPassword"
          :label="t('new_password', 'New Password', 'Nowe hasło')"
          :form="$f"
          :required="true"
          :label-class="uiLabel"
        >
          <IconField :class="[uiInput]">
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="newPassword"
              :placeholder="
                t(
                  'enter_new_password',
                  'Enter new password',
                  'Wprowadź nowe hasło',
                )
              "
              :disabled="loading"
              toggle-mask
              :feedback="true"
              class="w-full"
              input-class="w-full"
              autocomplete="new-password"
            />
          </IconField>
          <small class="text-surface-500">Minimum 6 characters required</small>
        </EafFormItem>

        <EafFormItem
          for="confirmPassword"
          :label="t('confirm_password', 'Confirm Password', 'Potwierdź hasło')"
          :form="$f"
          :required="true"
          :label-class="uiLabel"
        >
          <IconField :class="[uiInput]">
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="confirmPassword"
              :placeholder="
                t(
                  'confirm_new_password',
                  'Confirm new password',
                  'Potwierdź nowe hasło',
                )
              "
              :disabled="loading"
              toggle-mask
              :feedback="false"
              class="w-full"
              input-class="w-full"
              autocomplete="new-password"
            />
          </IconField>
        </EafFormItem>

        <Button
          type="submit"
          :label="t('reset_password', 'Reset Password', 'Resetuj hasło')"
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

      <!-- Success state -->
      <div v-else-if="success" class="flex flex-col gap-5">
        <Message severity="success" :closable="false">
          Your password has been successfully reset! You can now log in with
          your new password.
        </Message>
        <Button
          :label="t('go_to_login', 'Go to Login', 'Przejdź do logowania')"
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
  .eaf-recover-password-title {
    font-weight: 600;
    font-size: 1.75rem;
  }
}
</style>
