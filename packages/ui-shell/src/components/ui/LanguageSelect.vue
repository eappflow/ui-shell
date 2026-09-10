<script setup lang="ts">
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import Select from "primevue/select";
import { useScopedI18n } from "../../composables/useScopedI18n";
import { I18n_CONFIG_KEY } from "../../services/interfaces";

interface Props {
  withLabel?: boolean;
}

withDefaults(defineProps<Props>(), {
  withLabel: false,
});

const { t } = useScopedI18n();
const { locale } = useI18n({ useScope: "global" });
const i18nConfig = inject(I18n_CONFIG_KEY);

const languageOptions = computed(() =>
  (i18nConfig?.supportedLanguages ?? []).map(
    ({ localeCode, displayNameKey }) => ({
      label: t(displayNameKey, displayNameKey, displayNameKey),
      value: localeCode,
    }),
  ),
);

const languageSelectPt = {
  option: ({ context }: { context: { option: { value: string } } }) => ({
    "data-testid": `language-option-${context.option.value}`,
  }),
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <span v-if="withLabel" class="text-sm">{{
      t("language", "Language", "Język")
    }}</span>
    <Select
      v-model="locale"
      :options="languageOptions"
      option-label="label"
      option-value="value"
      append-to="self"
      class="w-full"
      data-testid="language-select"
      :pt="languageSelectPt"
    />
  </div>
</template>
