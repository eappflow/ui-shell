import { markRaw } from "vue";
import type { EafField, EafFields } from "../types";

/**
 * Symbol-keyed flag on every field handle telling whether the form was created
 * with `showAllErrors`. Lets `EafFormItem` honour the form-level setting
 * without widening the public `EafField` interface.
 * @internal
 */
export const EAF_FIELD_SHOW_ALL_ERRORS = Symbol("eaf:field-show-all-errors");

/**
 * Form state the field handles read from
 * @internal
 */
export interface EafFieldsSource {
  /** Current error messages of the field at `path` (reactive read) */
  getErrors: (path: string) => string[];
  /** Whether the field at `path` has a `required` rule */
  isRequired: (path: string) => boolean;
  showAllErrors: boolean;
}

/**
 * Keys that never resolve to a child handle:
 * - `__v_*` - Vue probes `__v_isRef`, `__v_skip`, `__v_isReactive`,
 *   `__v_raw`... on props and state; a handle answering them with an object
 *   would be treated as a ref/proxy;
 * - `then` - otherwise `await`/`Promise.resolve` would treat a handle as
 *   a thenable;
 * - `toJSON` - so `JSON.stringify` serializes the handle's metadata;
 * - `Object.prototype` members (`constructor`, `toString`, `valueOf`...) -
 *   so string conversion and devtools/inspectors keep working.
 */
function isReservedKey(key: string): boolean {
  return (
    key.startsWith("__v_") ||
    key === "then" ||
    key === "toJSON" ||
    key in Object.prototype
  );
}

/**
 * Creates the lazy tree of field handles (`$f.fields`) of a form.
 *
 * Handles are Proxies built on access from the path, not from the data, so
 * `$f.fields.address.street` exists even while `data.address` is `null`.
 * Each handle is created once per path and cached, so the same path always
 * gives the same object (stable prop identity, no needless re-renders).
 * Handles are `markRaw`, so they're never wrapped by `reactive()`.
 * @internal
 */
export function createEafFields<T>(source: EafFieldsSource): EafFields<T> {
  const handles = new Map<string, object>();

  function getHandle(path: string): object {
    let handle = handles.get(path);
    if (!handle) {
      handle = createNode(path);
      handles.set(path, handle);
    }
    return handle;
  }

  /**
   * @param path Path of the field, or `null` for the root (`$f.fields`),
   *   which has children but no metadata of its own
   */
  function createNode(path: string | null): object {
    const target: Record<PropertyKey, unknown> = {};

    if (path !== null) {
      Object.defineProperties(target, {
        $path: { value: path, enumerable: true },
        $required: {
          get: () => source.isRequired(path),
          enumerable: true,
        },
        $errors: { get: () => source.getErrors(path), enumerable: true },
        $error: {
          get: () => source.getErrors(path)[0],
          enumerable: true,
        },
        [EAF_FIELD_SHOW_ALL_ERRORS]: { value: source.showAllErrors },
      } satisfies Record<keyof EafField | symbol, PropertyDescriptor>);
    }

    const node = new Proxy(target, {
      get(obj, key, receiver) {
        if (
          typeof key === "symbol" ||
          Object.prototype.hasOwnProperty.call(obj, key) ||
          isReservedKey(key)
        ) {
          return Reflect.get(obj, key, receiver);
        }
        return getHandle(path === null ? key : `${path}.${key}`);
      },
    });

    return markRaw(node);
  }

  return createNode(null) as EafFields<T>;
}
