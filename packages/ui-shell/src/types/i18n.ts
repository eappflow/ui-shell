import { I18nOptions } from "vue-i18n";

export interface Language {
  /** Locale code (e.g., "en", "pl") */
  localeCode: string;
  /** Display name translation key of the language */
  displayNameKey: string;
}

export interface I18nConfig {
  /** Default language (e.g., "en") */
  defaultLanguage: string;
  supportedLanguages: Language[];
  messages: I18nOptions["messages"];
}
