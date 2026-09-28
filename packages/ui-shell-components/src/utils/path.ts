/**
 * Internal helpers for dot-separated field paths (`"address.street"`,
 * `"items.0.name"`). Not exported from the package entry point.
 * @internal
 */

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

/**
 * Splits a dot-separated path into its segments
 *
 * @returns The segments, or `null` for an empty path or one with empty
 *   segments (`""`, `"a..b"`, `".a"`)
 */
function splitPath(path: string): string[] | null {
  const segments = path.split(".");
  return segments.every((segment) => segment !== "") ? segments : null;
}

/**
 * Whether `value` is a plain object (`{}`/`Object.create(null)`, or a Vue
 * reactive proxy of one) - as opposed to arrays, `Date`, `File`, class
 * instances etc., which forms treat as single values.
 */
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

const NOT_FOUND = Symbol("not-found");

/**
 * Walks `path` through own properties of `source`
 *
 * @returns The value at the path, or `NOT_FOUND` if any segment is missing
 */
function resolvePath(source: unknown, path: string): unknown {
  const segments = splitPath(path);
  if (!segments) {
    return NOT_FOUND;
  }

  let current: unknown = source;
  for (const segment of segments) {
    if (
      current === null ||
      typeof current !== "object" ||
      !hasOwn(current, segment)
    ) {
      return NOT_FOUND;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Reads the value at a dot-separated path. Array indexes are plain segments
 * (`"items.0.name"`). Only own properties are followed, so `"toString"` does
 * not resolve to `Object.prototype.toString`.
 *
 * @returns The value, or `undefined` if any segment is missing
 */
export function getByPath(source: unknown, path: string): unknown {
  const value = resolvePath(source, path);
  return value === NOT_FOUND ? undefined : value;
}

/**
 * Whether a dot-separated path exists in `source` (every segment is an own
 * property, even if its value is `null`/`undefined`). Array indexes are plain
 * segments (`"items.0.name"`).
 */
export function hasPath(source: unknown, path: string): boolean {
  return resolvePath(source, path) !== NOT_FOUND;
}
