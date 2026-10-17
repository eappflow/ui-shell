import type { EafLeaf } from "./fields";

/**
 * What the AI chat is told about the form, nested like its data: a field's
 * text, or an object's or list's `$description` next to its fields' (a list's
 * items' in `$each`). The top `$description` is the whole form's.
 */
export type EafAiDescriptions<T> = { $description?: string } & {
  [K in keyof T]?: EafAiDescriptionOf<NonNullable<T[K]>>;
};

/** Description of a value `V` */
export type EafAiDescriptionOf<V> = V extends readonly (infer E)[]
  ?
      | string
      | { $description?: string; $each?: EafAiDescriptionOf<NonNullable<E>> }
  : V extends EafLeaf
    ? string
    : string | EafAiDescriptions<V>;
