<script setup lang="ts">
import { ref } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import Password from "primevue/password";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import {
  useEafForm,
  EafFormItem,
  EafFormValidationSummary,
} from "@eappflow/ui-shell-components";
import { z } from "zod";
import { useScopedI18n } from "../composables/useScopedI18n";

const toast = useToast();
const { t } = useScopedI18n();

const $f = useEafForm({
  defaultValues: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
  schema: z
    .object({
      currentPassword: z.string(),
      // Functions, so the messages follow a language change
      newPassword: z.string().min(6, {
        error: () =>
          t(
            "password_too_short",
            "Password must be at least 6 characters",
            "Hasło musi mieć co najmniej 6 znaków",
          ),
      }),
      confirmPassword: z.string(),
    })
    .refine((form) => form.newPassword === form.confirmPassword, {
      error: () =>
        t(
          "passwords_mismatch",
          "Passwords do not match",
          "Hasła nie są takie same",
        ),
      path: ["confirmPassword"],
    })
    .refine((form) => form.currentPassword !== form.newPassword, {
      error: () =>
        t(
          "password_unchanged",
          "New password must be different from current password",
          "Nowe hasło musi się różnić od obecnego",
        ),
      path: ["newPassword"],
    }),
  async onSubmit() {
    // In real scenario: this would call authService via store
    // await authService.changePassword({ currentPassword, newPassword })
    // The form's reset, not resetForm() - that one hides the success message too
    $f.resetForm();
    success.value = true;
    toast.add({
      severity: "success",
      summary: "Success",
      detail: "Your password has been changed successfully",
      life: 5000,
    });
  },
});
const success = ref(false);

function resetForm() {
  $f.resetForm();
  success.value = false;
}
</script>

<template>
  <div class="w-full max-w-md mx-auto space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-100">
        Change Password
      </h1>
      <p class="text-surface-600 dark:text-surface-400 mt-2">
        Update your current password to a new one
      </p>
    </div>

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

    <Card>
      <template #content>
        <form class="space-y-6" @submit.prevent="$f.submit()">
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

          <!-- Like the login's password -->
          <EafFormItem
            v-slot="{ id }"
            :field="$f.fields.currentPassword"
            :label="t('current_password', 'Current Password', 'Aktualne hasło')"
          >
            <IconField>
              <InputIcon class="pi pi-lock" />
              <Password
                v-model="$f.data.currentPassword"
                :input-id="id"
                :disabled="$f.loading.value"
                :placeholder="
                  t(
                    'enter_current_password',
                    'Enter your current password',
                    'Wprowadź swoje aktualne hasło',
                  )
                "
                :feedback="false"
                toggle-mask
                class="w-full"
                input-class="w-full"
                autocomplete="current-password"
              />
            </IconField>
          </EafFormItem>

          <EafFormItem
            v-slot="{ id }"
            :field="$f.fields.newPassword"
            :label="t('new_password', 'New Password', 'Nowe hasło')"
          >
            <IconField>
              <InputIcon class="pi pi-lock" />
              <Password
                v-model="$f.data.newPassword"
                :input-id="id"
                :disabled="$f.loading.value"
                :placeholder="
                  t(
                    'enter_new_password',
                    'Enter your new password',
                    'Wprowadź swoje nowe hasło',
                  )
                "
                :feedback="true"
                toggle-mask
                class="w-full"
                input-class="w-full"
                autocomplete="new-password"
              />
            </IconField>
            <small class="text-surface-500">{{
              t(
                "minimum_6_characters",
                "Minimum 6 characters required",
                "Minimalnie 6 znaków wymaganych",
              )
            }}</small>
          </EafFormItem>

          <EafFormItem
            v-slot="{ id }"
            :field="$f.fields.confirmPassword"
            :label="
              t(
                'confirm_new_password',
                'Confirm New Password',
                'Potwierdź nowe hasło',
              )
            "
          >
            <IconField>
              <InputIcon class="pi pi-lock" />
              <Password
                v-model="$f.data.confirmPassword"
                :input-id="id"
                :disabled="$f.loading.value"
                :placeholder="
                  t(
                    'confirm_new_password',
                    'Confirm New Password',
                    'Potwierdź nowe hasło',
                  )
                "
                :feedback="false"
                toggle-mask
                class="w-full"
                input-class="w-full"
                autocomplete="new-password"
              />
            </IconField>
          </EafFormItem>

          <div class="flex justify-end gap-3 pt-4">
            <Button
              :label="t('cancel', 'Cancel', 'Anuluj')"
              severity="secondary"
              outlined
              :disabled="$f.loading.value"
              @click="resetForm"
            />
            <Button
              type="submit"
              :label="t('change_password', 'Change Password', 'Zmień hasło')"
              :loading="$f.loading.value"
            />
          </div>
        </form>
      </template>
    </Card>
  </div>
</template>
