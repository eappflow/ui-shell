import { toRaw } from "vue";
import { isPlainObject } from "./path";

/**
 * Copies plain objects, arrays and `Date`s, keeps the rest by reference.
 * Unlike `structuredClone`, takes reactive proxies and never throws.
 */
export function cloneDeep<V>(value: V): V {
  const raw: unknown = toRaw(value);

  if (Array.isArray(raw)) {
    return raw.map((item) => cloneDeep(item)) as V;
  }

  if (raw instanceof Date) {
    return new Date(raw.getTime()) as V;
  }

  if (isPlainObject(raw)) {
    const copy: Record<string, unknown> = Object.create(
      Object.getPrototypeOf(raw),
    );
    for (const key of Object.keys(raw)) {
      copy[key] = cloneDeep(raw[key]);
    }
    return copy as V;
  }

  return raw as V;
}
