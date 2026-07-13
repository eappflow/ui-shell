import { createScopedI18n } from "./composables/createScopedI18n";
import pl from "./locales/pl.json";
import en from "./locales/en.json";

/**
 * Scoped i18n composable for `@eappflow/ui-shell` internal translations.
 *
 * Backed by `src/locales/en.json` and `src/locales/pl.json`.
 * The active locale follows the global vue-i18n locale.
 *
 * @example
 * import { useScopedI18n } from "../i18n";
 *
 * const { t } = useScopedI18n();
 *
 * // key lookup
 * t("login.title")
 *
 * // inline fallback (no JSON entry needed)
 * t("save_btn", "Save", "Zapisz")
 * t("items_count", "{count} items", "{count} elementów", { count: n })
 */
export const useScopedI18n = createScopedI18n({
  pl: pl,
  en: en,
});
