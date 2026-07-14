<script setup lang="ts">
import { ref } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Password from "primevue/password";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import {
  useEafFormValidation,
  EafFormItem,
  EafFormValidationSummary,
} from "@eappflow/ui-shell-components";
import { useScopedI18n } from "../composables/useScopedI18n";

const toast = useToast();

const $f = useEafFormValidation();
const loading = ref(false);
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const success = ref(false);
const { t } = useScopedI18n();

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
        <form class="space-y-6" @submit.prevent="handleChangePassword">
          <Message
            v-if="success"
            severity="success"
            :closable="true"
            @close="success = false"
          >
            {{
              t(
                "password_changed_successfully",
                "Your password has been changed successfully!",
                "Twoje hasło zostało pomyślnie zmienione!",
              )
            }}
          </Message>

          <EafFormValidationSummary :form="$f" />

          <Message severity="info" :closable="false">
            {{
              t(
                "password_change_info",
                "For security reasons, you will need to use your new password for future logins.",
                "Ze względów bezpieczeństwa będziesz musiał używać nowego hasła przy przyszłych logowaniach.",
              )
            }}
          </Message>

          <EafFormValidationSummary :form="$f" />

          <Message severity="info" :closable="false">
            {{
              t(
                "password_change_info",
                "For security reasons, you will need to use your new password for future logins.",
                "Ze względów bezpieczeństwa będziesz musiał używać nowego hasła przy przyszłych logowaniach.",
              )
            }}
          </Message>

          <EafFormItem
            field="currentPassword"
            :label="t('current_password', 'Current Password', 'Aktualne hasło')"
            :form="$f"
            :required="true"
          >
            <Password
              v-model="currentPassword"
              :disabled="loading"
              :placeholder="
                t(
                  'enter_current_password',
                  'Enter your current password',
                  'Wprowadź swoje aktualne hasło',
                )
              "
              :feedback="false"
              toggle-mask
            />
          </EafFormItem>

          <EafFormItem
            field="newPassword"
            :label="t('new_password', 'New Password', 'Nowe hasło')"
            :form="$f"
            :required="true"
          >
            <Password
              v-model="newPassword"
              :disabled="loading"
              :placeholder="
                t(
                  'enter_new_password',
                  'Enter your new password',
                  'Wprowadź swoje nowe hasło',
                )
              "
              :feedback="true"
              toggle-mask
            />
            <small class="text-surface-500">{{
              t(
                "minimum_6_characters",
                "Minimum 6 characters required",
                "Minimalnie 6 znaków wymaganych",
              )
            }}</small>
          </EafFormItem>

          <EafFormItem
            field="confirmPassword"
            :label="
              t(
                'confirm_new_password',
                'Confirm New Password',
                'Potwierdź nowe hasło',
              )
            "
            :form="$f"
            :required="true"
          >
            <Password
              v-model="confirmPassword"
              :disabled="loading"
              :placeholder="
                t(
                  'confirm_new_password',
                  'Confirm New Password',
                  'Potwierdź nowe hasło',
                )
              "
              :feedback="false"
              toggle-mask
            />
          </EafFormItem>

          <div class="flex justify-end gap-3 pt-4">
            <Button
              :label="t('cancel', 'Cancel', 'Anuluj')"
              severity="secondary"
              outlined
              :disabled="loading"
              @click="resetForm"
            />
            <Button
              type="submit"
              :label="t('change_password', 'Change Password', 'Zmień hasło')"
              :loading="loading"
            />
          </div>
        </form>
      </template>
    </Card>

    <Card>
      <template #header>
        <div class="px-6 pt-6">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <i class="pi pi-shield text-primary" />
            {{
              t(
                "password_security_tips",
                "Password Security Tips",
                "Wskazówki dotyczące bezpieczeństwa haseł",
              )
            }}
          </h3>
        </div>
      </template>
      <template #content>
        <ul
          class="list-disc list-inside space-y-2 text-surface-700 dark:text-surface-300"
        >
          <li>
            {{
              t(
                "use_at_least_6_characters",
                "Use at least 6 characters (longer is better)",
                "Użyj co najmniej 6 znaków (im dłuższe, tym lepsze)",
              )
            }}
          </li>
          <li>
            {{
              t(
                "mix_uppercase_and_lowercase",
                "Mix uppercase and lowercase letters",
                "Mieszaj wielkie i małe litery",
              )
            }}
          </li>
          <li>
            {{
              t(
                "include_numbers_and_special_characters",
                "Include numbers and special characters",
                "Dołącz numery i znaki specjalne",
              )
            }}
          </li>
          <li>
            {{
              t(
                "avoid_common_words",
                "Avoid common words or personal information",
                "Unikaj powszechnych słów lub informacji osobistych",
              )
            }}
          </li>
          <li>
            {{
              t(
                "don_t_reuse_passwords",
                "Don't reuse passwords from other accounts",
                "Nie powtarzaj haseł z innych kont",
              )
            }}
          </li>
          <li>
            {{
              t(
                "change_password_regularly",
                "Change your password regularly",
                "Regularnie zmieniaj swoje hasło",
              )
            }}
          </li>
        </ul>
      </template>
    </Card>
  </div>
</template>
