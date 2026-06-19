<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import { useAuthStore } from "../stores/useAuthStore";
import { useEafFormValidation, EafFormItem, EafFormValidationSummary } from "@eappflow/ui-shell-components";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const $f = useEafFormValidation();
const login = ref("");
const password = ref("");
const loading = ref(false);

const redirectUrl = computed(() => {
    const redirect = route.query.redirect as string | undefined;
    if (redirect && typeof redirect === "string" && redirect.startsWith("/")) {
        return redirect;
    }
    return "/";
});

function validateForm(): boolean {
    $f.clearErrors();
    let isValid = true;
    if (!login.value.trim()) {
        $f.setFieldError("login", "Login is required");
        isValid = false;
    }
    if (!password.value) {
        $f.setFieldError("password", "Password is required");
        isValid = false;
    }
    return isValid;
}

async function handleLogin(): Promise<void> {
    if (!validateForm()) return;
    loading.value = true;
    try {
        await authStore.login(login.value, password.value);
        router.push(redirectUrl.value);
    } catch (error: unknown) {
        $f.handleApiError(error);
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="bg-red-400 dark:bg-surface-800 rounded-lg shadow-lg p-8">
        <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                Login
            </h2>
            <p class="text-surface-600 dark:text-surface-400">
                Enter your credentials to access the portal
            </p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
            <EafFormValidationSummary :form="$f" />

            <EafFormItem field="login" label="Login" :form="$f" :required="true">
                <InputText v-model="login" placeholder="Enter your login" :disabled="loading" class="w-full" autocomplete="username" />
            </EafFormItem>

            <EafFormItem field="password" label="Password" :form="$f" :required="true">
                <Password v-model="password" placeholder="Enter your password" :disabled="loading" :feedback="false" toggleMask class="w-full" inputClass="w-full" autocomplete="current-password" />
            </EafFormItem>

            <div class="text-right">
                <router-link to="/restore-password" class="text-sm text-primary hover:underline">
                    Recover password
                </router-link>
            </div>

            <Button type="submit" label="Login" :loading="loading" class="w-full" size="large" />
        </form>
    </div>
</template>