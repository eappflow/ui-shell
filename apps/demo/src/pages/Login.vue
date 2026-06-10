<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@eappflow/ui-shell";
import { EafInput, EafButton } from "@eappflow/ui-shell-components";

const router = useRouter();
const authStore = useAuthStore();

const email = ref("demo@eappflow.io");
const password = ref("password");

async function handleLogin() {
    await authStore.login(email.value, password.value);
    router.push("/");
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center">
        <div class="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h1 class="text-xl font-bold text-slate-900">
                Login
            </h1>
            <p class="mt-1 text-sm text-slate-600">
                Sign in to access the demo.
            </p>
            <form class="mt-6 space-y-4" @submit.prevent="handleLogin">
                <EafInput v-model="email" label="Email" type="email" placeholder="demo@eappflow.io" required />
                <EafInput v-model="password" label="Password" type="password" placeholder="••••••••" required />
                <EafButton variant="primary" class="w-full">
                    Sign In
                </EafButton>
            </form>
        </div>
    </div>
</template>