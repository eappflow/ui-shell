<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useNavigation } from "../composables/useNavigation";
import { filterVisibleMenuModules } from "../utils/permissions";
import type { MenuItem } from "../types";

const router = useRouter();
const route = useRoute();
const auth = useAuth();
const navigation = useNavigation();

const props = defineProps<{
    compact?: boolean;
}>();

const emit = defineEmits<{
    "item-click": [item: MenuItem];
}>();

const visibleMenuModules = computed(() =>
    filterVisibleMenuModules(navigation.menuModules, auth.userPermissions),
);

function navigateToPage(item: MenuItem): void {
    router.push(item.path);
    emit("item-click", item);
}

function isActive(itemPath: string): boolean {
    return route.path === itemPath;
}
</script>

<template>
    <nav>
        <div v-for="module in visibleMenuModules" :key="module.name" class="app-nav-module mb-6">
            <!-- Module Header -->
            <div class="app-nav-module-header px-3 py-2 text-surface-500 dark:text-surface-400 text-xs font-semibold uppercase tracking-wider">
                {{ module.name }}
            </div>

            <!-- Module Items -->
            <div class="app-nav-module-items space-y-1 mt-1">
                <button v-for="item in module.items" :key="item.path" @click="navigateToPage(item)"
                    class="app-sidebar-item w-full flex items-center gap-3 px-3 py-2 rounded-lg text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all cursor-pointer text-left"
                    :class="{
                        'bg-primary-50 dark:bg-primary-900/20 text-primary font-medium': isActive(item.path),
                    }">
                    <i v-if="item.icon" :class="item.icon"></i>
                    <span class="text-sm">{{ item.name }}</span>
                </button>
            </div>
        </div>
    </nav>
</template>