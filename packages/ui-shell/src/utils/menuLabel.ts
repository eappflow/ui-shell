import type { Composer } from "vue-i18n";

/** A menu group's or item's label. Falls back to `name` when no key is set or no translation exists for it. */
export function menuLabel(
  { t, te }: Pick<Composer, "t" | "te">,
  entry: { name: string; nameKey?: string },
): string {
  return entry.nameKey && te(entry.nameKey) ? t(entry.nameKey) : entry.name;
}
