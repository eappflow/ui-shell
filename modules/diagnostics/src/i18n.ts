import { createScopedI18n } from "@eappflow/ui-shell";
import pl from "./locales/pl.json";
import en from "./locales/en.json";

export const useScopedI18n = createScopedI18n({
  pl: pl,
  en: en,
});
