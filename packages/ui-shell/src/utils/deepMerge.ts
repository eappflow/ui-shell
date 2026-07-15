type PlainObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is PlainObject {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

/**
 * Recursively merges plain objects, source properties overriding target
 * ones at every level. Non-object values (including arrays) are replaced
 * outright rather than merged.
 */
export function deepMerge<T extends PlainObject>(
  target: T,
  source: PlainObject,
): T {
  const result: PlainObject = { ...target };

  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = result[key];
    result[key] =
      isPlainObject(targetValue) && isPlainObject(sourceValue)
        ? deepMerge(targetValue, sourceValue)
        : sourceValue;
  }

  return result as T;
}
