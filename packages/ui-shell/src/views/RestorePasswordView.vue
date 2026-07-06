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

const router = useRouter();
const authStore = useAuthStore();
const appConfig = inject(APP_CONFIG_KEY, { name: "App", version: "0.0.0" });

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
      <span :class="[uiCard?.title]"> Reset Password </span>
    </template>
    <template #subtitle>
      <span :class="[uiCard?.subtitle]">
        Enter your email to receive password reset instructions
      </span>
    </template>
    <template #content>
      <form
        v-if="!success"
        @submit.prevent="handleRestorePassword"
        class="flex flex-col gap-5"
      >
        <EafFormValidationSummary :form="$f" />

        <EafFormItem
          field="email"
          label="Email"
          :form="$f"
          :required="true"
          :labelClass="uiLabel"
        >
          <IconField :class="[uiInput]">
            <InputIcon class="pi pi-envelope" />
            <InputText
              v-model="email"
              type="email"
              placeholder="Enter your email"
              :disabled="loading"
              class="w-full"
              autocomplete="email"
            />
          </IconField>
        </EafFormItem>

        <Button
          type="submit"
          label="Send Reset Link"
          :loading="loading"
          :class="['w-full', uiButton]"
          size="large"
        />

        <div class="text-center">
          <Button
            label="Back to Login"
            link
            @click="goToLogin"
            :disabled="loading"
          />
        </div>
      </form>

      <div v-else class="flex flex-col gap-5">
        <Message severity="success" :closable="false">
          Password reset instructions have been sent to your email address.
        </Message>
        <p class="text-sm text-surface-600">
          If the email exists, a password reset link has been sent. The link
          will expire in 2 days.
        </p>
        <Button
          label="Back to Login"
          :class="['w-full', uiButton]"
          size="large"
          @click="goToLogin"
        />
      </div>
    </template>
  </Card>
</template>
