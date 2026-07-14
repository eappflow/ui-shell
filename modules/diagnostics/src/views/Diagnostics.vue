<script setup lang="ts">
import Panel from "primevue/panel";
import Tag from "primevue/tag";
import { useEafNavigation } from "@eappflow/ui-shell";
import { useAuthStore } from "@eappflow/ui-shell";
import { computed } from "vue";
import { useScopedI18n } from "../i18n";

const navigationStore = useEafNavigation();
const authStore = useAuthStore();
const { t } = useScopedI18n();

const registeredModules = computed(() => navigationStore.moduleIds);
const modulePermissionsMap = computed(() => navigationStore.modulePermissions);
const registeredPermissions = computed(
  () => navigationStore.registeredPermissions,
);
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

function getPermissionSeverity(
  perm: string,
): "success" | "danger" | "info" | "warn" | "secondary" | "contrast" {
  if (currentUserPermissions.value.includes(perm)) return "success";
  return "danger";
}

function getModuleSeverity(
  modId: string,
): "info" | "success" | "warn" | "danger" | "secondary" | "contrast" {
  const colors = ["info", "success", "warn", "info", "contrast"];
  const hash = modId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length] as
    | "info"
    | "success"
    | "warn"
    | "info"
    | "contrast";
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Registered Modules -->
    <Panel toggleable>
      <template #header>
        <div class="flex items-center gap-3">
          <i class="pi pi-box text-xl text-primary" />
          <span class="font-semibold">{{
            t(
              "loaded_modules",
              "Loaded eAppFlow Modules",
              "Załadowane Moduły eAppFlow",
            )
          }}</span>
          <Tag :value="registeredModules.length" severity="info" />
        </div>
      </template>
      <div
        v-if="registeredModules.length === 0"
        class="text-zinc-400 italic py-4 text-center"
      >
        <i class="pi pi-info-circle mr-2" />{{
          t(
            "diagnostics.no-modules-registered",
            "No modules registered.",
            "Brak zarejestrowanych modułów.",
          )
        }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-200">
              <th class="text-left py-3 px-3 font-medium text-zinc-500">
                {{ t("diagnostics.module-id", "Module ID", "ID Modułu") }}
              </th>
              <th class="text-left py-3 px-3 font-medium text-zinc-500">
                {{
                  t(
                    "diagnostics.declared-permissions",
                    "Declared Permissions",
                    "Deklarowane Uprawnienia",
                  )
                }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="modId in registeredModules"
              :key="modId"
              class="border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              <td class="py-3 px-3">
                <Tag :value="modId" :severity="getModuleSeverity(modId)" />
              </td>
              <td class="py-3 px-3">
                <div class="flex flex-wrap gap-1">
                  <Tag
                    v-for="perm in modulePermissionsMap[modId] || []"
                    :key="perm"
                    :value="perm"
                    :severity="getPermissionSeverity(perm)"
                    class="text-xs"
                  />
                  <span
                    v-if="!(modulePermissionsMap[modId] || []).length"
                    class="text-zinc-400 italic text-xs"
                  >
                    none
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>

    <!-- Loaded Menu Items -->
    <Panel toggleable>
      <template #header>
        <div class="flex items-center gap-3">
          <i class="pi pi-list text-xl text-primary" />
          <span class="font-semibold">{{
            t(
              "loaded_menu_modules_and_items",
              "Loaded Menu Modules & Items",
              "Załadowane Moduły i Elementy Menu",
            )
          }}</span>
          <Tag :value="menuModules.length" severity="info" />
        </div>
      </template>
      <div
        v-if="menuModules.length === 0"
        class="text-zinc-400 italic py-4 text-center"
      >
        <i class="pi pi-info-circle mr-2" />{{
          t(
            "diagnostics.no-menu-modules-registered",
            "No menu modules registered.",
            "Brak zarejestrowanych modułów menu.",
          )
        }}
      </div>
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="mod in menuModules"
          :key="mod.name"
          class="border border-zinc-200 rounded-lg overflow-hidden"
        >
          <div
            class="flex items-center gap-2 px-4 py-3 bg-zinc-50 border-b border-zinc-200"
          >
            <i :class="mod.icon || 'pi pi-folder'" class="text-primary" />
            <span class="font-semibold">{{ mod.name }}</span>
            <Tag
              :value="mod.items.length"
              severity="secondary"
              class="ml-auto"
            />
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-zinc-100">
                  <th class="text-left py-2 px-4 font-medium text-zinc-500">
                    {{ t("name", "Name", "Nazwa") }}
                  </th>
                  <th class="text-left py-2 px-4 font-medium text-zinc-500">
                    {{ t("icon", "Icon", "Ikona") }}
                  </th>
                  <th class="text-left py-2 px-4 font-medium text-zinc-500">
                    {{ t("path", "Path", "Ścieżka") }}
                  </th>
                  <th class="text-left py-2 px-4 font-medium text-zinc-500">
                    {{
                      t(
                        "required_permissions",
                        "Required Permissions",
                        "Wymagane Uprawnienia",
                      )
                    }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in mod.items"
                  :key="item.name"
                  class="border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
                >
                  <td class="py-2 px-4">
                    {{ item.name }}
                  </td>
                  <td class="py-2 px-4">
                    <code
                      class="text-xs text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded"
                      >{{ item.icon || "—" }}</code
                    >
                  </td>
                  <td class="py-2 px-4">
                    <code
                      class="text-xs text-primary bg-zinc-100 px-1.5 py-0.5 rounded"
                      >{{ item.path }}</code
                    >
                  </td>
                  <td class="py-2 px-4">
                    <div class="flex flex-wrap gap-1">
                      <Tag
                        v-for="perm in item.permissions || []"
                        :key="perm"
                        :value="perm"
                        :severity="getPermissionSeverity(perm)"
                        class="text-xs"
                      />
                      <span
                        v-if="
                          !item.permissions || item.permissions.length === 0
                        "
                        class="text-zinc-400 italic text-xs"
                      >
                        public
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Panel>

    <!-- Loaded Permissions -->
    <Panel toggleable>
      <template #header>
        <div class="flex items-center gap-3">
          <i class="pi pi-lock text-xl text-primary" />
          <span class="font-semibold">
            {{
              t(
                "loaded_permissions_and_sources",
                "Loaded Permissions & Sources",
                "Załadowane Uprawnienia i Źródła",
              )
            }}
          </span>
          <Tag :value="registeredPermissions.length" severity="info" />
        </div>
      </template>
      <div
        v-if="registeredPermissions.length === 0"
        class="text-zinc-400 italic py-4 text-center"
      >
        <i class="pi pi-info-circle mr-2" />
        {{
          t(
            "no_permissions_declared",
            "No permissions declared across modules.",
            "Brak zadeklarowanych uprawnień w modułach.",
          )
        }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-200">
              <th class="text-left py-3 px-3 font-medium text-zinc-500">
                {{ t("permission", "Permission", "Uprawnienie") }}
              </th>
              <th class="text-left py-3 px-3 font-medium text-zinc-500">
                {{
                  t(
                    "source-modules",
                    "Source Module(s)",
                    "Moduł(y) Źródłowy(e)",
                  )
                }}
              </th>
              <th class="text-left py-3 px-3 font-medium text-zinc-500">
                {{
                  t(
                    "current-user-has",
                    "Current User Has",
                    "Bieżący Użytkownik Ma",
                  )
                }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="perm in registeredPermissions"
              :key="perm"
              class="border-b border-zinc-100 hover:bg-zinc-50 transition-colors"
            >
              <td class="py-3 px-3">
                <code
                  class="text-sm bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-mono"
                  >{{ perm }}</code
                >
              </td>
              <td class="py-3 px-3">
                <div class="flex flex-wrap gap-1">
                  <Tag
                    v-for="modId in getModulesForPermission(perm)"
                    :key="modId"
                    :value="modId"
                    :severity="getModuleSeverity(modId)"
                    class="text-xs"
                  />
                  <span
                    v-if="!hasModuleWithPermission(perm)"
                    class="text-zinc-400 italic text-xs"
                  >
                    {{
                      t(
                        "external-runtime",
                        "external / runtime",
                        "zewnętrzne / w czasie wykonywania",
                      )
                    }}
                  </span>
                </div>
              </td>
              <td class="py-3 px-3">
                <i
                  v-if="currentUserPermissions.includes(perm)"
                  class="pi pi-check-circle text-green-500 text-lg"
                />
                <i v-else class="pi pi-times-circle text-red-400 text-lg" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  </div>
</template>
