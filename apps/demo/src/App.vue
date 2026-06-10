<script setup lang="ts">
import { onMounted } from "vue";
import { AppLayout, useNavigationStore } from "@eappflow/ui-shell";
import "./assets/main.css";

const navigationStore = useNavigationStore();

onMounted(() => {
    navigationStore.setItems([
        { label: "Dashboard", to: "/", icon: "📊" },
        { label: "Settings", to: "/settings", icon: "⚙️" },
    ]);
});
</script>

<template>
    <AppLayout>
        <router-view />
    </AppLayout>
</template>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;
</style>