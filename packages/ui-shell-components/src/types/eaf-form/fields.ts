/** Values that are a single field, not an object of fields */
export type EafLeaf =
  | string
  | number
  | boolean
  | bigint
  | Date
  | File
  | Blob
  | readonly unknown[];

/** A field from `$f.fields`, e.g. `$f.fields.items[0].name` */
export interface EafField {
  /** e.g. `"items[0].name"`, the API's error key */
  readonly $path: string;
  /** All errors */
  readonly $errors: string[];
  /** First error */
  readonly $error: string | undefined;
  /** The schema takes no empty value there */
  readonly $required: boolean;
  /** Sets the errors, e.g. from a custom check */
  readonly $setError: (messages: string | string[]) => void;
  /** Removes the errors */
  readonly $clearError: () => void;
  /** Checks the field as leaving it does, see `validateOn` - `EafFormItem` calls it on focus out */
  readonly $touch: () => void;
}

/** Field of `V` plus the fields inside it */
type EafFieldOf<V> = EafField &
  (V extends readonly (infer E)[]
    ? { readonly [index: number]: EafFieldOf<NonNullable<E>> }
    : V extends EafLeaf
      ? unknown
      : EafFields<V>);

/** Fields mirroring the data `T`: `$f.fields.items[0].name` */
export type EafFields<T> = {
  readonly [K in keyof T & string]-?: EafFieldOf<NonNullable<T[K]>>;
};
