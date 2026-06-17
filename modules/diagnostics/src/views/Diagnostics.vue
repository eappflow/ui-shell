<script setup lang="ts">
import Card from "primevue/card";
import { useEafNavigation } from "@eappflow/ui-shell";
import { useAuthStore } from "@eappflow/ui-shell";
import { computed } from "vue";

const navigationStore = useEafNavigation();
const authStore = useAuthStore();

const registeredModules = computed(() => navigationStore.moduleIds);
const modulePermissionsMap = computed(() => navigationStore.modulePermissions);
const registeredPermissions = computed(() => navigationStore.registeredPermissions);
const menuModules = computed(() => navigationStore.menuModules);
const currentUserPermissions = computed(() => authStore.userPermissions);

function getModulesForPermission(perm: string): string[] {
    return Object.entries(modulePermissionsMap.value)
        .filter(([, perms]) => perms.includes(perm))
        .map(([id]) => id);
}

function hasModuleWithPermission(perm: string): boolean {
    return Object.values(modulePermissionsMap.value).some((perms) =>
        perms.includes(perm),
    );
}
</script>

<template>
    <div class="space-y-6">
        <!-- Registered Modules -->
        <Card>
            <template #title>
                <div class="flex items-center gap-3">
                    <i class="pi pi-box text-2xl text-primary"></i>
                    <span class="text-xl font-semibold">Loaded eAppFlow Modules</span>
                </div>
            </template>
            <template #content>
                <div v-if="registeredModules.length === 0" class="text-muted-color italic">
                    No modules registered.
                </div>
                <div v-else class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-surface-200 dark:border-surface-700">
                                <th class="text-left py-2 px-3 font-medium text-muted-color">Module ID</th>
                                <th class="text-left py-2 px-3 font-medium text-muted-color">Declared Permissions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="modId in registeredModules" :key="modId" class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800">
                                <td class="py-2 px-3 font-mono">{{ modId }}</td>
                                <td class="py-2 px-3">
                                    <span v-for="perm in modulePermissionsMap[modId] || []" :key="perm" class="inline-block mr-1 mb-1 px-2 py-0.5 rounded text-xs font-medium"
                                        :class="currentUserPermissions.includes(perm) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400'">
                                        {{ perm }}
                                    </span>
                                    <span v-if="!(modulePermissionsMap[modId] || []).length" class="text-muted-color italic text-xs">
                                        none
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </Card>

        <!-- Loaded Menu Items with Parameters -->
        <Card>
            <template #title>
                <div class="flex items-center gap-3">
                    <i class="pi pi-list text-2xl text-primary"></i>
                    <span class="text-xl font-semibold">Loaded Menu Modules &amp; Items</span>
                </div>
            </template>
            <template #content>
                <div v-if="menuModules.length === 0" class="text-muted-color italic">
                    No menu modules registered.
                </div>
                <div v-else class="space-y-4">
                    <div v-for="mod in menuModules" :key="mod.name" class="border rounded-lg border-surface-200 dark:border-surface-700">
                        <div class="flex items-center gap-2 px-4 py-3 bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 rounded-t-lg">
                            <i :class="mod.icon || 'pi pi-folder'" class="text-primary"></i>
                            <span class="font-semibold">{{ mod.name }}</span>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="border-b border-surface-100 dark:border-surface-800">
                                        <th class="text-left py-2 px-4 font-medium text-muted-color">Name</th>
                                        <th class="text-left py-2 px-4 font-medium text-muted-color">Icon</th>
                                        <th class="text-left py-2 px-4 font-medium text-muted-color">Path</th>
                                        <th class="text-left py-2 px-4 font-medium text-muted-color">Required Permissions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in mod.items" :key="item.name" class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800">
                                        <td class="py-2 px-4">{{ item.name }}</td>
                                        <td class="py-2 px-4 font-mono text-xs">{{ item.icon || "—" }}</td>
                                        <td class="py-2 px-4 font-mono text-xs">{{ item.path }}</td>
                                        <td class="py-2 px-4">
                                            <span v-for="perm in item.permissions || []" :key="perm" class="inline-block mr-1 mb-1 px-2 py-0.5 rounded text-xs font-medium"
                                                :class="currentUserPermissions.includes(perm) ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'">
                                                {{ perm }}
                                            </span>
                                            <span v-if="!item.permissions || item.permissions.length === 0" class="text-muted-color italic text-xs">
                                                public
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Loaded Permissions with Source Information -->
        <Card>
            <template #title>
                <div class="flex items-center gap-3">
                    <i class="pi pi-lock text-2xl text-primary"></i>
                    <span class="text-xl font-semibold">Loaded Permissions &amp; Sources</span>
                </div>
            </template>
            <template #content>
                <div v-if="registeredPermissions.length === 0" class="text-muted-color italic">
                    No permissions declared across modules.
                </div>
                <div v-else class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-surface-200 dark:border-surface-700">
                                <th class="text-left py-2 px-3 font-medium text-muted-color">Permission</th>
                                <th class="text-left py-2 px-3 font-medium text-muted-color">Source Module(s)</th>
                                <th class="text-left py-2 px-3 font-medium text-muted-color">Current User Has</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="perm in registeredPermissions" :key="perm" class="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800">
                                <td class="py-2 px-3 font-mono">{{ perm }}</td>
                                <td class="py-2 px-3">
                                    <span v-for="modId in getModulesForPermission(perm)" :key="modId"
                                        class="inline-block mr-1 mb-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {{ modId }}
                                    </span>
                                    <span v-if="!hasModuleWithPermission(perm)" class="text-muted-color italic text-xs">
                                        external / runtime
                                    </span>
                                </td>
                                <td class="py-2 px-3">
                                    <i v-if="currentUserPermissions.includes(perm)" class="pi pi-check-circle text-green-500"></i>
                                    <i v-else class="pi pi-times-circle text-red-400"></i>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </template>
        </Card>
    </div>
</template>