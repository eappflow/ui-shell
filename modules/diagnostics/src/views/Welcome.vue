<script setup lang="ts">
import Panel from "primevue/panel";
import Button from "primevue/button";
import { useRouter } from "vue-router";
import { useScopedI18n } from "../";
const { t } = useScopedI18n();

const router = useRouter();
</script>

<template>
  <div class="flex flex-col gap-6">
    <Panel>
      <template #header>
        <div class="flex items-center gap-4">
          <i class="pi pi-home text-4xl text-primary" />
          <div>
            <span class="text-2xl font-semibold">{{
              t("welcome", "Welcome to eAppFlow", "Witaj w eAppFlow")
            }}</span>
            <p class="text-zinc-500 text-sm mt-0.5">
              {{
                t(
                  "your-modular-application-shell",
                  "Your modular application shell",
                  "Twoja modułowa powłoka aplikacji",
                )
              }}
            </p>
          </div>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <p class="text-zinc-700 leading-relaxed">
          <strong>eAppFlow</strong>
          {{
            t(
              "is-a-modular-application-shell",
              "is a modular application shell that provides a foundation for building enterprise applications with a consistent look and feel.",
              "jest modułową powłoką aplikacji, która zapewnia fundament do budowania aplikacji korporacyjnych o spójnym wyglądzie i odczuciu.",
            )
          }}
        </p>
        <p class="text-zinc-600 leading-relaxed">
          {{
            t(
              "ui-shell-framework",
              "Built on the UI-Shell framework — a modular, role-based component library powered by Vue 3, PrimeVue, and TailwindCSS. UI-Shell delivers a consistent, responsive experience with dynamic menus, permission-based access control, and theming support across all modules.",
              "Zbudowany na frameworku UI-Shell — modułowej, opartej na rolach bibliotece komponentów zasilanej przez Vue 3, PrimeVue i TailwindCSS. UI-Shell zapewnia spójne, responsywne doświadczenie z dynamicznymi menu, kontrolą dostępu opartą na uprawnieniach i obsługą motywów we wszystkich modułach.",
            )
          }}
        </p>

        <div class="flex gap-3 mt-2">
          <Button
            :label="
              t('view_diagnostics', 'View Diagnostics', 'Wyświetl Diagnostykę')
            "
            icon="pi pi-shield"
            @click="router.push('/diagnostics')"
          />
        </div>
      </div>
    </Panel>
  </div>
</template>
