<script setup lang="ts">
import { ref } from "vue";
import { EafButton, EafModal, EafInput } from "@eappflow/ui-shell-components";

const showModal = ref(false);

function handleClick() {
    alert("Button clicked!");
}
</script>

<template>
    <div>
        <h1 class="text-2xl font-bold text-slate-900">
            Dashboard
        </h1>
        <p class="mt-2 text-slate-600">
            Welcome to the eAppFlow UI Shell demo.
        </p>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 class="text-sm font-medium text-slate-500">
                    Users
                </h3>
                <p class="mt-1 text-2xl font-bold text-slate-900">
                    1,234
                </p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 class="text-sm font-medium text-slate-500">
                    Revenue
                </h3>
                <p class="mt-1 text-2xl font-bold text-slate-900">
                    $45,678
                </p>
            </div>
            <div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <h3 class="text-sm font-medium text-slate-500">
                    Orders
                </h3>
                <p class="mt-1 text-2xl font-bold text-slate-900">
                    567
                </p>
            </div>
        </div>

        <div class="mt-6 flex gap-2">
            <EafButton variant="primary" @click="handleClick">
                Primary Button
            </EafButton>
            <EafButton variant="secondary">
                Secondary
            </EafButton>
            <EafButton variant="danger">
                Delete
            </EafButton>
        </div>

        <div class="mt-6 max-w-sm">
            <EafInput label="Full Name" placeholder="Enter your name" hint="We'll use this for your profile" />
        </div>

        <div class="mt-4">
            <EafButton variant="primary" @click="showModal = true">
                Open Modal
            </EafButton>
            <EafModal :visible="showModal" @close="showModal = false">
                <template #header>
                    Demo Modal
                </template>
                <p>This is a modal dialog rendered via the ui-shell-components package.</p>
                <template #footer>
                    <EafButton variant="secondary" @click="showModal = false">
                        Close
                    </EafButton>
                </template>
            </EafModal>
        </div>
    </div>
</template>