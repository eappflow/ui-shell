<script setup lang="ts">
import { ref } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Password from "primevue/password";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { useAuthStore } from "../stores/useAuthStore";
import {
  useEafFormValidation,
  EafFormItem,
  EafFormValidationSummary,
} from "@eappflow/ui-shell-components";

const authStore = useAuthStore();
const toast = useToast();

const $f = useEafFormValidation();
const loading = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const success = ref(false);

function resetForm() {
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
  $f.clearErrors();
  success.value = false;
}

function validateForm(): boolean {
  $f.clearErrors();
  let isValid = true;

  if (!currentPassword.value) {
    $f.setFieldError("currentPassword", "Current password is required");
    isValid = false;
  }

  if (!newPassword.value) {
    $f.setFieldError("newPassword", "New password is required");
    isValid = false;
  } else if (newPassword.value.length < 6) {
    $f.setFieldError("newPassword", "Password must be at least 6 characters");
    isValid = false;
  }

  if (!confirmPassword.value) {
    $f.setFieldError("confirmPassword", "Please confirm your new password");
    isValid = false;
  } else if (newPassword.value !== confirmPassword.value) {
    $f.setFieldError("confirmPassword", "Passwords do not match");
    isValid = false;
  }

  if (
    currentPassword.value &&
    newPassword.value &&
    currentPassword.value === newPassword.value
  ) {
    $f.setFieldError(
      "newPassword",
      "New password must be different from current password",
    );
    isValid = false;
  }

  return isValid;
}

async function handleChangePassword() {
  if (!validateForm()) return;
  loading.value = true;
  try {
    // In real scenario: this would call authService via store
    // await authService.changePassword({ currentPassword: ..., newPassword: ... })
    success.value = true;
    resetForm();
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Your password has been changed successfully",
      life: 5000,
    });
  } catch (error: unknown) {
    $f.handleApiError(error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-100">
        Change Password
      </h1>
      <p class="text-surface-600 dark:text-surface-400 mt-2">
        Update your current password to a new one
      </p>
    </div>

    <Card>
      <template #content>
        <form @submit.prevent="handleChangePassword" class="space-y-6">
          <Message
            v-if="success"
            severity="success"
            :closable="true"
            @close="success = false"
          >
            Your password has been changed successfully!
          </Message>

          <EafFormValidationSummary :form="$f" />

          <Message severity="info" :closable="false">
            For security reasons, you will need to use your new password for
            future logins.
          </Message>

          <EafFormValidationSummary :form="$f" />

          <Message severity="info" :closable="false">
            For security reasons, you will need to use your new password for
            future logins.
          </Message>

          <EafFormItem
            field="currentPassword"
            label="Current Password"
            :form="$f"
            :required="true"
          >
            <Password
              v-model="currentPassword"
              :disabled="loading"
              placeholder="Enter your current password"
              :feedback="false"
              toggleMask
            />
          </EafFormItem>

          <EafFormItem
            field="newPassword"
            label="New Password"
            :form="$f"
            :required="true"
          >
            <Password
              v-model="newPassword"
              :disabled="loading"
              placeholder="Enter your new password"
              :feedback="true"
              toggleMask
            />
            <small class="text-surface-500"
              >Minimum 6 characters required</small
            >
          </EafFormItem>

          <EafFormItem
            field="confirmPassword"
            label="Confirm New Password"
            :form="$f"
            :required="true"
          >
            <Password
              v-model="confirmPassword"
              :disabled="loading"
              placeholder="Confirm your new password"
              :feedback="false"
              toggleMask
            />
          </EafFormItem>

          <div class="flex justify-end gap-3 pt-4">
            <Button
              label="Cancel"
              severity="secondary"
              outlined
              @click="resetForm"
              :disabled="loading"
            />
            <Button type="submit" label="Change Password" :loading="loading" />
          </div>
        </form>
      </template>
    </Card>

    <Card>
      <template #header>
        <div class="px-6 pt-6">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <i class="pi pi-shield text-primary"></i>
            Password Security Tips
          </h3>
        </div>
      </template>
      <template #content>
        <ul
          class="list-disc list-inside space-y-2 text-surface-700 dark:text-surface-300"
        >
          <li>Use at least 6 characters (longer is better)</li>
          <li>Mix uppercase and lowercase letters</li>
          <li>Include numbers and special characters</li>
          <li>Avoid common words or personal information</li>
          <li>Don't reuse passwords from other accounts</li>
          <li>Change your password regularly</li>
        </ul>
      </template>
    </Card>
  </div>
</template>
