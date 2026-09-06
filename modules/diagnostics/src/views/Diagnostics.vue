<script setup lang="ts">
import Panel from "primevue/panel";
import Tag from "primevue/tag";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useEafNavigation } from "@eappflow/ui-shell";
import { useAuthStore } from "@eappflow/ui-shell";
import { computed } from "vue";
import { useScopedI18n } from "../composables/i18n";

const navigationStore = useEafNavigation();
const authStore = useAuthStore();
const { t } = useScopedI18n();

const registeredModules = computed(() => navigationStore.moduleIds);
const modulePermissionsMap = computed(() => navigationStore.modulePermissions);
const registeredPermissions = computed(
  () => navigationStore.registeredPermissions,
);
const menuModules = computed(() => navigationStore.menuModules);
const menuItemRows = computed(() =>
  menuModules.value.flatMap((mod) =>
    mod.items.map((item) => ({
      ...item,
      moduleName: mod.name,
      moduleIcon: mod.icon,
    })),
  ),
);
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
          <Tag
            :value="registeredModules.length"
            severity="info"
          />
        </div>
      </template>
      <div
        v-if="registeredModules.length === 0"
        class="text-eaf-ink-muted italic py-4 text-center"
      >
        <i class="pi pi-info-circle mr-2" />{{
          t(
            "diagnostics.no-modules-registered",
            "No modules registered.",
            "Brak zarejestrowanych modułów.",
          )
        }}
      </div>
      <DataTable
        v-else
        :value="registeredModules.map((id) => ({ id }))"
      >
        <Column
          field="id"
          :header="t('diagnostics.module-id', 'Module ID', 'ID Modułu')"
        >
          <template #body="{ data }">
            <Tag
              :value="data.id"
              :severity="getModuleSeverity(data.id)"
            />
          </template>
        </Column>
        <Column
          :header="
            t(
              'diagnostics.declared-permissions',
              'Declared Permissions',
              'Deklarowane Uprawnienia',
            )
          "
        >
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="perm in modulePermissionsMap[data.id] || []"
                :key="perm"
                :value="perm"
                :severity="getPermissionSeverity(perm)"
                class="text-xs"
              />
              <span
                v-if="!(modulePermissionsMap[data.id] || []).length"
                class="text-eaf-ink-muted italic text-xs"
              >
                none
              </span>
            </div>
          </template>
        </Column>
      </DataTable>
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
          <Tag
            :value="menuItemRows.length"
            severity="info"
          />
        </div>
      </template>
      <div
        v-if="menuItemRows.length === 0"
        class="text-eaf-ink-muted italic py-4 text-center"
      >
        <i class="pi pi-info-circle mr-2" />{{
          t(
            "diagnostics.no-menu-modules-registered",
            "No menu modules registered.",
            "Brak zarejestrowanych modułów menu.",
          )
        }}
      </div>
      <DataTable
        v-else
        :value="menuItemRows"
      >
        <Column :header="t('module', 'Module', 'Moduł')">
          <template #body="{ data }">
            <Tag
              :value="data.moduleName"
              :icon="data.moduleIcon"
              severity="secondary"
            />
          </template>
        </Column>
        <Column
          field="name"
          :header="t('name', 'Name', 'Nazwa')"
        />
        <Column :header="t('icon', 'Icon', 'Ikona')">
          <template #body="{ data }">
            <code
              class="text-xs text-eaf-ink-muted bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded"
            >{{ data.icon || "—" }}</code>
          </template>
        </Column>
        <Column :header="t('path', 'Path', 'Ścieżka')">
          <template #body="{ data }">
            <code
              class="text-xs text-primary bg-surface-100 dark:bg-surface-700 px-1.5 py-0.5 rounded"
            >{{ data.path }}</code>
          </template>
        </Column>
        <Column
          :header="
            t(
              'required_permissions',
              'Required Permissions',
              'Wymagane Uprawnienia',
            )
          "
        >
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="perm in data.permissions || []"
                :key="perm"
                :value="perm"
                :severity="getPermissionSeverity(perm)"
                class="text-xs"
              />
              <span
                v-if="!data.permissions || data.permissions.length === 0"
                class="text-eaf-ink-muted italic text-xs"
              >
                public
              </span>
            </div>
          </template>
        </Column>
      </DataTable>
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
          <Tag
            :value="registeredPermissions.length"
            severity="info"
          />
        </div>
      </template>
      <div
        v-if="registeredPermissions.length === 0"
        class="text-eaf-ink-muted italic py-4 text-center"
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
      <DataTable
        v-else
        :value="registeredPermissions.map((permission) => ({ permission }))"
      >
        <Column
          field="permission"
          :header="t('permission', 'Permission', 'Uprawnienie')"
        >
          <template #body="{ data }">
            <code
              class="text-sm bg-surface-100 dark:bg-surface-700 text-eaf-ink px-2 py-0.5 rounded font-mono"
            >{{ data.permission }}</code>
          </template>
        </Column>
        <Column
          :header="
            t('source-modules', 'Source Module(s)', 'Moduł(y) Źródłowy(e)')
          "
        >
          <template #body="{ data }">
            <div class="flex flex-wrap gap-1">
              <Tag
                v-for="modId in getModulesForPermission(data.permission)"
                :key="modId"
                :value="modId"
                :severity="getModuleSeverity(modId)"
                class="text-xs"
              />
              <span
                v-if="!hasModuleWithPermission(data.permission)"
                class="text-eaf-ink-muted italic text-xs"
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
          </template>
        </Column>
        <Column
          :header="
            t('current-user-has', 'Current User Has', 'Bieżący Użytkownik Ma')
          "
        >
          <template #body="{ data }">
            <i
              v-if="currentUserPermissions.includes(data.permission)"
              class="pi pi-check-circle text-green-500 text-lg"
            />
            <i
              v-else
              class="pi pi-times-circle text-red-400 text-lg"
            />
          </template>
        </Column>
      </DataTable>
    </Panel>
  </div>
</template>
