import { watch } from "vue";
import { createI18n, I18n } from "vue-i18n";
import type { Composer, I18nOptions } from "vue-i18n";
import { deepMerge } from "../utils/deepMerge";
import pl from "../locales/pl.json";
import en from "../locales/en.json";
import type { EafModule, I18nConfig } from "../types";

const LOCAL_STORAGE_KEY = "locale";
let i18nInstance: I18n | null = null;

export function createDefaultI18nConfig(): I18nConfig {
  return {
    defaultLanguage: "en",
    supportedLanguages: [
      { localeCode: "pl", displayNameKey: "pl" },
      { localeCode: "en", displayNameKey: "en" },
    ],
    messages: {
      pl: pl,
      en: en,
    },
  };
}

function getLocale(i18nConfig: I18nConfig): string {
  const savedLocale = localStorage.getItem(LOCAL_STORAGE_KEY);
  const browserLocale = navigator.language.split("-")[0];
  const supportedLocales = i18nConfig.supportedLanguages.map(
    (lang) => lang.localeCode,
  );

  if (savedLocale && supportedLocales.includes(savedLocale)) {
    return savedLocale;
  } else if (supportedLocales.includes(browserLocale)) {
    return browserLocale;
  } else {
    return i18nConfig.defaultLanguage;
  }
}

function mergeModulesMessages(modules: EafModule[], i18nConfig?: I18nConfig) {
  let mergedMessages = { ...i18nConfig?.messages };

  modules.forEach((module) => {
    if (module.menuI18nMessages) {
      for (const [lang, messages] of Object.entries(module.menuI18nMessages)) {
        if (mergedMessages[lang] === undefined) {
          mergedMessages[lang] = {};
        }
        mergedMessages[lang] = deepMerge(mergedMessages[lang], {
          menu: {
            [module.id]: messages,
          },
        });
      }
    }
  });

  return mergedMessages;
}

export function getEafI18n() {
  return i18nInstance;
}

export function createEafI18n(
  modules: EafModule[],
  i18nConfig?: I18nConfig,
): {
  i18n: I18n;
  eafI18nConfig: I18nConfig;
} {
  const defaults = createDefaultI18nConfig();

  let eafI18nConfig: I18nConfig = {
    ...defaults,
    ...i18nConfig,
    // Deep-merged so a host's own messages add to the shell's defaults
    // at every nesting level instead of replacing whole namespaces.
    messages: deepMerge(
      defaults.messages ?? {},
      i18nConfig?.messages ?? {},
    ) as I18nOptions["messages"],
  };

  eafI18nConfig.messages = mergeModulesMessages(modules, eafI18nConfig);

  const i18nOptions: I18nOptions = {
    locale: getLocale(eafI18nConfig),
    messages: eafI18nConfig.messages,
    availableLocales:
      eafI18nConfig.supportedLanguages?.map((l) => l.localeCode) ?? [],
    legacy: false, // Ensure we use Composition API
  };

  const i18n = createI18n(i18nOptions);
  i18nInstance = i18n;
  watch(
    () => (i18n.global as unknown as Composer).locale.value,
    (lang) => {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    },
    { immediate: true },
  );
  return { i18n, eafI18nConfig };
}
