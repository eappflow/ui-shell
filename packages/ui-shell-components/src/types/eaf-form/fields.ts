/**
 * Values treated as a single form field (a leaf) rather than an object whose
 * keys are fields of their own.
 *
 * Arrays, `Date`, `File` and `Blob` are leaves too, otherwise the mapped types
 * would walk into `keyof string[]` (`length`, `push`...) or `keyof Date`.
 * Per-item handles/rules for arrays (`items.0.name`) are not supported yet.
 */
export type EafLeaf =
  | string
  | number
  | boolean
  | bigint
  | Date
  | File
  | Blob
  | readonly unknown[];

/**
 * Handle of a single form field, e.g. `$f.fields.address.street`.
 *
 * Metadata is `$`-prefixed so it never collides with the keys of the form data
 * (`$f.fields.address` is both the `address` field and the container of
 * `$f.fields.address.street`). All metadata is read lazily, so reading
 * `$errors`/`$error` inside a `computed` or a template is reactive.
 *
 * @typeParam V Type of the field's value. Not used by the interface yet, it
 *   documents the handle and leaves room for value-aware members later.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface EafField<V = unknown> {
  /**
   * Dot-separated path of the field in the form data, e.g. `"address.street"`.
   * Used as the key in `fieldErrors`, for `name`/`data-testid` in
   * `EafFormItem` and to map API validation errors onto the field.
   */
  readonly $path: string;

  /**
   * Whether the field has a `required` rule (for an object node: the
   * `required` flag of the node itself).
   */
  readonly $required: boolean;

  /**
   * All current error messages of the field (empty array if none).
   */
  readonly $errors: string[];

  /**
   * First current error message of the field, or `undefined` if none.
   */
  readonly $error: string | undefined;
}

/**
 * Children of a field handle: nested handles for an object value, nothing for
 * a leaf value.
 */
export type EafFieldChildren<V> =
  NonNullable<V> extends EafLeaf ? unknown : EafFields<NonNullable<V>>;

/**
 * Tree of field handles mirroring the form data `T` (`useEafForm(...).fields`).
 *
 * Every key of `T` (optional or not) has a handle, including keys whose value
 * is currently `null`/`undefined` - handles are built from the path, not from
 * the data.
 */
export type EafFields<T> = {
  readonly [K in keyof T & string]-?: EafField<T[K]> & EafFieldChildren<T[K]>;
};

/**
 * Path of a field accepted by the string-based APIs (`isFieldRequired`).
 *
 * Top-level keys of `T` are checked, deeper segments are not
 * (`"address.street"`) - prefer field handles (`$f.fields.address.street`)
 * for full type safety. Kept deliberately cheap: no recursive template-literal
 * union of all paths.
 */
export type EafFieldPath<T> =
  | Extract<keyof T, string>
  | `${Extract<keyof T, string>}.${string}`;
