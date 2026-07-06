<script setup lang="ts">
import Panel from "primevue/panel";
import Button from "primevue/button";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
    <div class="flex flex-col gap-6">
        <Panel>
            <template #header>
                <div class="flex items-center gap-4">
                    <i class="pi pi-home text-4xl text-primary"></i>
                    <div>
                        <span class="text-2xl font-semibold">Welcome to eAppFlow</span>
                        <p class="text-zinc-500 text-sm mt-0.5">Your modular application shell</p>
                    </div>
                </div>
            </template>

            <div class="flex flex-col gap-4">
                <p class="text-zinc-700 leading-relaxed">
                    <strong>eAppFlow</strong> is a powerful management platform for enterprise Solutions.
                </p>
                <p class="text-zinc-600 leading-relaxed">
                    Built on the <strong>UI-Shell</strong> framework — a modular, role-based component library
                    powered by Vue 3, PrimeVue, and TailwindCSS. UI-Shell delivers a consistent, responsive
                    experience with dynamic menus, permission-based access control, and theming support
                    across all modules.
                </p>

                <div class="flex gap-3 mt-2">
                    <Button
                        label="View Diagnostics"
                        icon="pi pi-shield"
                        @click="router.push('/diagnostics')"
                    />
                </div>
            </div>
        </Panel>
    </div>
</template>
