<script setup lang="ts">
import { ref, computed, inject, onMounted } from "vue";
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
          classImage="max-h-18"
          :show-app-name="false"
          :placement="LogoPlacement.UNAUTHORIZED_LAYOUT_COMPONENTS"
        />
      </div>
      <div class="mb-5">
        <h1 :class="['eaf-recover-password-title', uiCard?.title]">
          Reset Your Password
        </h1>
      </div>
    </template>
    <template #subtitle>
      <span :class="[uiCard?.subtitle]"> Enter your new password below </span>
    </template>
    <template #content>
      <!-- Token error state -->
      <div v-if="tokenError" class="flex flex-col gap-5">
        <Message severity="error" :closable="false">
          {{ tokenError }}
        </Message>
        <div class="flex flex-col gap-3">
          <Button
            label="Request New Reset Link"
            :class="['w-full', uiButton]"
            size="large"
            @click="requestNewReset"
          />
          <Button
            label="Back to Login"
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
          field="newPassword"
          label="New Password"
          :form="$f"
          :required="true"
          :label-class="uiLabel"
        >
          <IconField :class="[uiInput]">
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="newPassword"
              placeholder="Enter new password"
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
          field="confirmPassword"
          label="Confirm Password"
          :form="$f"
          :required="true"
          :label-class="uiLabel"
        >
          <IconField :class="[uiInput]">
            <InputIcon class="pi pi-lock" />
            <Password
              v-model="confirmPassword"
              placeholder="Confirm new password"
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
          label="Reset Password"
          :loading="loading"
          :class="['w-full', uiButton]"
          size="large"
        />

        <div class="text-center">
          <Button
            label="Back to Login"
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
          label="Go to Login"
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
