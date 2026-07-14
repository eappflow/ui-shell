import { watch } from "vue";
import type { I18nService } from "../services/interfaces";
import { Composer, createI18n, I18n, I18nOptions } from "vue-i18n";
import { deepMerge } from "../utils/deepMerge";
import pl from "../locales/pl.json";
import en from "../locales/en.json";

const LOCAL_STORAGE_KEY = "locale";

export function createDefaultI18nService(): I18nService {
  return {
    avaiableLocales: [
      { localeCode: "pl", displayName: "Polski" },
      { localeCode: "en", displayName: "English" },
    ],
    locale: "en",
    messages: {
      pl: pl,
      en: en,
    },
  };
}

export function createI18nService(i18nService?: I18nService): {
  i18n: I18n;
  i18nService: I18nService;
} {
  const savedLocale = localStorage.getItem(LOCAL_STORAGE_KEY);
  const browser = navigator.language.split("-")[0]; // 'pl-PL' -> 'pl'
  const defaults = createDefaultI18nService();
  i18nService = {
    ...defaults,
    locale: savedLocale ?? browser ?? "en",
    ...i18nService,
    // Deep-merged so a host's own messages add to the shell's defaults
    // at every nesting level instead of replacing whole namespaces.
    messages: deepMerge(
      defaults.messages ?? {},
      i18nService?.messages ?? {},
    ) as I18nOptions["messages"],
  };

  const options: I18nOptions = {
    ...i18nService,
    availableLocales:
      i18nService.avaiableLocales?.map((l) => l.localeCode) ?? [],
    legacy: false, // Ensure we use Composition API
  };

  const i18n = createI18n(options);
  watch(
    () => (i18n.global as unknown as Composer).locale.value,
    (lang) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    },
    { immediate: true },
  );
  return { i18n, i18nService: i18nService };
}
