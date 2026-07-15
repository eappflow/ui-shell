import { useI18n, type UseI18nOptions, type Composer } from "vue-i18n";

type Messages = UseI18nOptions["messages"];

/**
 * Translate function returned by {@link useScopedI18n}.
 *
 * Two call signatures are supported — key-only lookup and inline fallbacks.
 */
export interface ScopedT {
  /**
   * Translate a key defined in the locale message files.
   *
   * @param key    Dot-notation message key, e.g. `"login.title"`
   * @param params Optional interpolation values, e.g. `{ count: 3 }`
   *
   * @example
   * t("login.title")
   * t("users_count", { count: users.length })
   */
  (key: string, params?: Record<string, any>): string;

  /**
   * Translate with per-locale inline fallback strings.
   *
   * The fallback is returned when the key is absent from the locale file,
   * so translations can live directly in the component without a JSON entry.
   *
   * @param key        Message key (dot-notation)
   * @param enFallback English fallback string, or interpolation params object
   * @param plFallback Polish fallback string
   * @param params     Optional interpolation values
   *
   * @example
   * t("save_btn", "Save", "Zapisz")
   * t("items_count", "{count} items", "{count} elementów", { count: n })
   */
  (
    key: string,
    enFallback: string | Record<string, any>,
    plFallback: string,
    params?: Record<string, any>,
  ): string;
}

/**
 * Factory that creates a `useScopedI18n` composable pre-loaded with the
 * given locale message maps.
 *
 * Call once per package or feature boundary to bind a fixed set of
 * translations to a composable, then export the result:
 *
 * @example
 * // src/i18n.ts
 * export const useScopedI18n = createScopedI18n({ en, pl });
 *
 * // inside a component
 * const { t } = useScopedI18n();
 */
export function createScopedI18n(messages: Messages) {
  /**
   * Vue composable that exposes `{ t }` for scoped translations.
   *
   * The active locale follows the global vue-i18n locale — change it via
   * `useI18n({ useScope: "global" })`.
   *
   * **Key lookup** (message must exist in the locale file):
   * ```ts
   * t("login.title")
   * t("users_count", { count: users.length })
   * ```
   *
   * **Inline fallback** (no JSON entry required):
   * ```ts
   * t("save_btn", "Save", "Zapisz")
   * t("items_count", "{count} items", "{count} elementów", { count: n })
   * ```
   */
  return function useScopedI18n(): { t: ScopedT } & Omit<Composer, "t" | "te"> {
    const { locale, t, te, ...rest } = useI18n({
      messages: messages,
      inheritLocale: true,
    });

    const tWithFallbacks = (
      key: string,
      enFallback: string,
      plFallback: string,
      params?: Record<string, any>,
    ) => {
      if (locale.value === "en" && !te(key)) {
        return t(key, params ?? {}, enFallback);
      }

      if (locale.value === "pl" && !te(key)) {
        return t(key, params ?? {}, plFallback);
      }

      return t(key, params ?? {});
    };

    const scopedT: ScopedT = (
      key: string,
      second?: string | Record<string, any>,
      third?: string,
      params?: Record<string, any>,
    ) => {
      if (typeof second === "string" && typeof third === "string") {
        return tWithFallbacks(key, second, third, params);
      }
      if (typeof second === "object") {
        return t(key, second);
      }
      return t(key);
    };

    return { t: scopedT, locale, ...rest };
  };
}
