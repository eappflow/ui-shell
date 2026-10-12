/** Form schema helpers: zod schemas checked against form data */
import type { z } from "zod";
import { isPlainObject, splitPath } from "./path";

/** `""` and `null` as missing, so a field the schema doesn't make `.optional()` is required */
export function blankToUndefined(value: unknown): unknown {
  if (value === "" || value === null) {
    return undefined;
  }
  if (Array.isArray(value)) {
    return value.map(blankToUndefined);
  }
  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        blankToUndefined(child),
      ]),
    );
  }
  return value;
}

/** An issue's path as the API's: `["items", 0, "name"]` → `items[0].name` */
export function issuePath(path: readonly PropertyKey[]): string {
  return path.reduce<string>((joined, key) => {
    if (typeof key === "number") return `${joined}[${key}]`;
    return joined ? `${joined}.${String(key)}` : String(key);
  }, "");
}

/** What `schemaAt` follows of a schema's definition */
interface Def {
  shape?: Record<string, z.ZodType>;
  element?: z.ZodType;
  /** `.optional()`, `.nullable()`, `.default()`... */
  innerType?: z.ZodType;
  /** `.transform()`, `.pipe()` */
  in?: z.ZodType;
}

const defOf = (schema: z.ZodType) => schema._zod.def as Def;

/** Through `.optional()`, `.nullable()`, `.transform()`... to the schema they wrap */
function unwrap(schema: z.ZodType): z.ZodType {
  const inner = defOf(schema).innerType ?? defOf(schema).in;
  return inner ? unwrap(inner) : schema;
}

/**
 * The part of `schema` for the field at `path`, e.g. `items[0].name` - or
 * `undefined` where it can't be followed (unions, records, lazy...)
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
