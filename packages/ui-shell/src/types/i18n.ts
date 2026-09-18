import { I18nOptions } from "vue-i18n";

export interface Language {
  /** Locale code (e.g., "en", "pl") */
  localeCode: string;
  /** Display name of the language, shown as-is (e.g., "Polski") */
  displayName: string;
}

export interface I18nConfig {
  /** Default language (e.g., "en") */
  defaultLanguage: string;
  supportedLanguages: Language[];
  messages: I18nOptions["messages"];
}
