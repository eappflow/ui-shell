<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import Button from "primevue/button";
import Password from "primevue/password";
import Message from "primevue/message";
import { useAuthStore } from "../stores/useAuthStore";
import { useFormValidation } from "../composables/useFormValidation";
import FormItem from "../components/FormItem.vue";
import FormValidationSummary from "../components/FormValidationSummary.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const $f = useFormValidation();
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const success = ref(false);
const token = ref("");
const tokenError = ref("");

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
    <div class="bg-white dark:bg-surface-800 rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                Reset Your Password
            </h2>
            <p class="text-surface-600 dark:text-surface-400">
                Enter your new password below
            </p>
        </div>

        <div v-if="tokenError" class="space-y-6">
            <Message severity="error" :closable="false">{{ tokenError }}</Message>
            <div class="flex flex-col gap-3">
                <Button label="Request New Reset Link" class="w-full" size="large" @click="requestNewReset" />
                <Button label="Back to Login" severity="secondary" outlined class="w-full" size="large" @click="goToLogin" />
            </div>
        </div>

        <form v-else-if="!success && token" @submit.prevent="handleResetPassword" class="space-y-6">
            <FormValidationSummary :form="$f" />

            <Message severity="info" :closable="false">
                Password reset links are valid for 2 days and can only be used once.
            </Message>

            <FormItem field="newPassword" label="New Password" :form="$f" :required="true">
                <Password v-model="newPassword" placeholder="Enter new password" :disabled="loading" toggleMask :feedback="true" class="w-full" inputClass="w-full" autocomplete="new-password" />
                <small class="text-surface-500">Minimum 6 characters required</small>
            </FormItem>

            <FormItem field="confirmPassword" label="Confirm Password" :form="$f" :required="true">
                <Password v-model="confirmPassword" placeholder="Confirm new password" :disabled="loading" toggleMask :feedback="false" class="w-full" inputClass="w-full" autocomplete="new-password" />
            </FormItem>

            <Button type="submit" label="Reset Password" :loading="loading" class="w-full" size="large" />

            <div class="text-center">
                <Button label="Back to Login" link @click="goToLogin" :disabled="loading" />
            </div>
        </form>

        <div v-else-if="success" class="space-y-6">
            <Message severity="success" :closable="false">
                Your password has been successfully reset! You can now log in with your new password.
            </Message>
            <Button label="Go to Login" class="w-full" size="large" @click="goToLogin" />
        </div>
    </div>
</template>