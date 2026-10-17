/** Field path helpers (`"address.street"`, `"items[0].name"`) */

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

/** `"items[0].name"` → `items`, `0`, `name`; `null` for empty segments */
export function splitPath(path: string): string[] | null {
  const segments = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  return segments.every((segment) => segment !== "") ? segments : null;
}

/** `{}` or a reactive proxy of one - not an array, `Date`, `File`... */
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

/** Value at `segments` (see `splitPath`) through own properties, or `NOT_FOUND` */
function resolvePath(source: unknown, segments: string[] | null): unknown {
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

/** Value at `path` (own properties only), or `undefined` */
export function getByPath(source: unknown, path: string): unknown {
  const value = resolvePath(source, splitPath(path));
  return value === NOT_FOUND ? undefined : value;
}

/** Whether `path` exists (even holding `null`/`undefined`) */
export function hasPath(source: unknown, path: string): boolean {
  return resolvePath(source, splitPath(path)) !== NOT_FOUND;
}

/** Sets the value at an existing `path` (see `hasPath`); `false` if there is none */
export function setByPath(
  target: unknown,
  path: string,
  value: unknown,
): boolean {
  const segments = splitPath(path);
  const key = segments?.pop();
  const parent = resolvePath(target, segments);
  if (key === undefined || resolvePath(parent, [key]) === NOT_FOUND) {
    return false;
  }
  (parent as Record<string, unknown>)[key] = value;
  return true;
}

/** `$f.fields`: property access builds the path, `$` members use `source` */
// ponytail: new Proxy per access, cache per path if re-renders get costly
export function createFields(
  source: {
    errors: (path: string) => string[];
    isRequired: (path: string) => boolean;
    setErrors: (path: string, messages: string | string[]) => void;
    clearErrors: (path: string) => void;
    touch: (path: string) => void;
    display: (path: string) => () => void;
  },
  path = "",
): unknown {
  return new Proxy(
    {},
    {
      get(target, key) {
        switch (key) {
          case "$path":
            return path;
          case "$errors":
            return source.errors(path);
          case "$error":
            return source.errors(path)[0];
          case "$required":
            return source.isRequired(path);
          case "$setError":
            return (messages: string | string[]) =>
              source.setErrors(path, messages);
          case "$clearError":
            return () => source.clearErrors(path);
          case "$touch":
            return () => source.touch(path);
          case "$display":
            return () => source.display(path);
        }
        // Not fields: symbols, Vue probes, `then`, Object.prototype members
        if (
          typeof key === "symbol" ||
          key.startsWith("__v_") ||
          key === "then" ||
          key in Object.prototype
        ) {
          return Reflect.get(target, key);
        }
        if (/^\d+$/.test(key)) {
          return createFields(source, `${path}[${key}]`);
        }
        return createFields(source, path ? `${path}.${key}` : key);
      },
    },
  );
}
