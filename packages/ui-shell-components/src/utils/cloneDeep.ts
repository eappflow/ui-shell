import { toRaw } from "vue";
import { isPlainObject } from "./path";

/**
 * Deep-clones form data: plain objects, arrays and `Date`s are copied,
 * anything else (primitives, `File`, `Blob`, class instances...) is kept by
 * reference.
 *
 * Unlike `structuredClone`, it accepts Vue reactive proxies (unwrapped with
 * `toRaw` at every level) and never throws on non-cloneable values.
 * @internal
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
