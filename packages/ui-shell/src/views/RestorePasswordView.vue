<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import { useAuthStore } from "../stores/useAuthStore";
import { useEafFormValidation, EafFormItem, EafFormValidationSummary } from "@eappflow/ui-shell-components";

const router = useRouter();
const authStore = useAuthStore();

const $f = useEafFormValidation();
const email = ref("");
const loading = ref(false);
const success = ref(false);

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
    <div class="bg-white dark:bg-surface-800 rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                Reset Password
            </h2>
            <p class="text-surface-600 dark:text-surface-400">
                Enter your email to receive password reset instructions
            </p>
        </div>

        <form v-if="!success" @submit.prevent="handleRestorePassword" class="space-y-6">
            <EafFormValidationSummary :form="$f" />

            <EafFormItem field="email" label="Email" :form="$f" :required="true">
                <InputText v-model="email" type="email" placeholder="Enter your email" :disabled="loading" class="w-full" autocomplete="email" />
            </EafFormItem>

            <Button type="submit" label="Send Reset Link" :loading="loading" class="w-full" size="large" />

            <div class="text-center">
                <Button label="Back to Login" link @click="goToLogin" :disabled="loading" />
            </div>
        </form>

        <div v-else class="space-y-6">
            <Message severity="success" :closable="false">
                Password reset instructions have been sent to your email address.
            </Message>
            <p class="text-sm text-surface-600 dark:text-surface-400">
                If the email exists, a password reset link has been sent. The link will expire in 2 days.
            </p>
            <Button label="Back to Login" class="w-full" size="large" @click="goToLogin" />
        </div>
    </div>
</template>