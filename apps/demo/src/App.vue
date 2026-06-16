<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { AppLayout } from "@eappflow/ui-shell";
import "./assets/main.css";

const route = useRoute();
const isPublicRoute = computed(() => route.meta?.public === true);
</script>

<template>
    <!-- Public routes (login, password reset) render standalone -->
    <router-view v-if="isPublicRoute" />

    <!-- Protected routes render inside AppLayout -->
    <AppLayout v-else>
        <router-view />
    </AppLayout>
</template>