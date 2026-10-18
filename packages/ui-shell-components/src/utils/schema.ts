/** Form schema helpers: zod schemas checked against form data */
import type { z } from "zod";
import { isPlainObject, splitPath } from "./path";

/** What an empty field holds: `undefined`, `null` or `""` */
export const isBlank = (value: unknown): boolean =>
  value === undefined || value === null || value === "";

/** An issue's path as the API's: `["items", 0, "name"]` → `items[0].name` */
export function issuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((joined, key) => {
    if (typeof key === "number") return `${joined}[${key}]`;
    return joined ? `${joined}.${String(key)}` : String(key);
  }, "");
}

/** What `schemaAt` follows of a schema's definition */
interface Def {
  /** `"string"`, `"number"`, `"object"`... */
  type?: string;
  shape?: Record<string, z.ZodType>;
  element?: z.ZodType;
  /** `.optional()`, `.nullable()`, `.default()`... */
  innerType?: z.ZodType;
  /** `.transform()`, `.pipe()` */
  in?: z.ZodType;
  /** `.default(x)`, `.prefault(x)` */
  defaultValue?: unknown;
  /** `z.tuple([...])` */
  items?: z.ZodType[];
  /** `z.record()`, `z.map()` */
  keyType?: z.ZodType;
  valueType?: z.ZodType;
  /** `z.union([...])` - orval wraps a nullable object in one of these */
  options?: z.ZodType[];
}

const defOf = (schema: z.ZodType) => schema._zod.def as Def;

/** A union's one option besides `null`/`undefined` - how orval writes a nullable object */
function soleOption(def: Def): z.ZodType | undefined {
  const options = def.options?.filter((option) => {
    const type = defOf(option).type;
    return type !== "null" && type !== "undefined" && type !== "void";
  });
  return options?.length === 1 ? options[0] : undefined;
}

/** Through `.optional()`, `.nullable()`, `.transform()`, a nullable union... to the schema they wrap */
function unwrap(schema: z.ZodType): z.ZodType {
  const def = defOf(schema);
  const inner = def.innerType ?? def.in ?? soleOption(def);
  return inner ? unwrap(inner) : schema;
}

/**
 * The part of `schema` for the field at `path`, e.g. `items[0].name` - or
 * `undefined` where it can't be followed (a union of several schemas, records,
 * lazy...)
 */
export function schemaAt(
  schema: z.ZodType | undefined,
  path: string,
): z.ZodType | undefined {
  const segments = splitPath(path);
  if (!segments) {
    return undefined;
  }
  let current = schema;
  for (const segment of segments) {
    const def = current && defOf(unwrap(current));
    if (/^\d+$/.test(segment)) {
      current = def?.element;
    } else {
      current =
        def?.shape && Object.hasOwn(def.shape, segment)
          ? def.shape[segment]
          : undefined;
    }
  }
  return current;
}

/**
 * Whether `schema` takes no empty value, so its field is required: neither
 * `undefined` nor `null`, nor `""` for a string - `z.string().min(1)`,
 * `z.number()`, but not `z.string()` or `.nullable()`
 */
export function isRequiredSchema(schema: z.ZodType): boolean {
  const blanks =
    defOf(unwrap(schema)).type === "string"
      ? [undefined, null, ""]
      : [undefined, null];
  return blanks.every((blank) => !schema.safeParse(blank).success);
}

/** `isBlank`, or an object with fields, all of them empty */
function isEmpty(value: unknown): boolean {
  return (
    isBlank(value) ||
    (isPlainObject(value) &&
      Object.keys(value).length > 0 &&
      Object.values(value).every(isEmpty))
  );
}

/**
 * A copy of `value` with what is empty - a cleared input (`""`), a whole
 * sub-object left empty - as "not set" where `schema` takes that: `null` where
 * it takes `null` (`.nullable()`, `.nullish()`), else `undefined` (`.optional()`,
 * so the key drops out of the JSON). A list is a value, even an empty one; its
 * items are gone through like the rest.
 */
export function blanksToUnset(
  schema: z.ZodType,
  value: unknown,
  path = "",
): unknown {
  const field = path && isEmpty(value) ? schemaAt(schema, path) : undefined;
  if (field?.safeParse(null).success) return null;
  if (field?.safeParse(undefined).success) return undefined;
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      blanksToUnset(schema, item, `${path}[${index}]`),
    );
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        blanksToUnset(schema, child, path ? `${path}.${key}` : key),
      ]),
    );
  }
  return value;
}

/** A `.default(x)`/`.prefault(x)` the schema declares, through optional/nullable wrappers */
function declaredDefault(schema: z.ZodType): {
  found: boolean;
  value: unknown;
} {
  let current: z.ZodType | undefined = schema;
  while (current) {
    const def = defOf(current);
    if (def.type === "default" || def.type === "prefault") {
      const value = def.defaultValue;
      return {
        found: true,
        value: typeof value === "function" ? (value as () => unknown)() : value,
      };
    }
    if (
      def.type === "optional" ||
      def.type === "nullable" ||
      def.type === "readonly" ||
      def.type === "nonoptional"
    ) {
      current = def.innerType;
      continue;
    }
    break;
  }
  return { found: false, value: undefined };
}

/**
 * The values a fresh form starts with, read off `schema` - what `defaultValues`
 * used to be written by hand: `""` for a string, `null` for an empty scalar,
 * `false`, `[]`, `{}` with its fields, and whatever `.default()`/`.prefault()`
 * declares. A `defaultValues` passed to `useEafForm` still overrides this, which
 * is where a form-only field, or one whose empty value differs from the schema,
 * goes.
 *
 * This reads Zod's internals (`._zod.def`), which are not public API: keep it
 * here with the other def reading, keep the `default` case non-throwing, and let
 * the tests pin the shape it relies on. See
 * https://zod.dev/v4/changelog?id=internal-changes
 */
export function deriveDefaults(schema: z.ZodType): unknown {
  const declared = declaredDefault(schema);
  if (declared.found) {
    return declared.value;
  }

  const def = defOf(schema);

  switch (def.type) {
    case "object":
      return Object.fromEntries(
        Object.entries(def.shape ?? {}).map(([key, child]) => [
          key,
          deriveDefaults(child),
        ]),
      );
    case "array":
    case "set":
      return [];
    case "tuple":
      return (def.items ?? []).map(deriveDefaults);
    case "record":
    case "map":
      return {};
    case "string":
      return "";
    case "boolean":
      return false;
    case "union": {
      // orval wraps a nullable object as `z.union([z.null(), z.object({...})])`:
      // keep the object so its inputs bind (an empty one goes out as `null`)
      const option = soleOption(def);
      return option ? deriveDefaults(option) : null;
    }
    case "pipe":
      return def.in ? deriveDefaults(def.in) : null;
    case "nonoptional":
    case "readonly":
    case "catch":
      // `.required()`, `.readonly()`, `.catch()` - the wrapped schema decides
      return def.innerType ? deriveDefaults(def.innerType) : null;
    case "optional":
    case "nullable": {
      // A sub-object/array stays one, so its inputs have something to bind to
      // (an empty one goes out unset on submit, see `blanksToUnset`)
      const base = unwrap(schema);
      const baseDef = defOf(base);
      if (baseDef.type === "object") return deriveDefaults(base);
      if (baseDef.type === "array" || baseDef.type === "set") return [];
      if (baseDef.type === "record" || baseDef.type === "map") return {};
      return null;
    }
    default:
      // number, date, enum, literal, union... - an empty scalar
      return null;
  }
}
