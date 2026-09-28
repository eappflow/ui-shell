import { IfExtends } from "../internal";
import type { EafLeaf } from "./fields";

export type EafRulesFor<V> = IfExtends<
  V,
  string,
  EafFormRuleLength & EafFormRulePattern
> &
  IfExtends<V, number, EafFormRuleRange> &
  EafFormRuleRequired;

/**
 * Rules of a nested object field: its own `required` flag plus the rules of
 * its children, e.g. `address: { required: true, street: { required: true } }`.
 *
 * `required` is the only reserved key - a data field literally named
 * `required` inside a nested object can't have rules of its own.
 */
export type EafObjectRules<T> = EafFormRuleRequired & EafRules<T>;

/**
 * Validation rules mirroring the form data `T`.
 *
 * - leaf fields (see {@link EafLeaf}) get {@link EafRulesFor} -
 *   `required`, `length`, `pattern`, `range` depending on the value type;
 * - object fields get {@link EafObjectRules} - `required` plus the rules of
 *   their children.
 *
 * At runtime a rule node is treated as an object node only when the current
 * value in the data is a plain object. When that value is `null`/`undefined`,
 * only the node's `required` flag is checked (error under the object's path)
 * and its children are skipped.
 */
export type EafRules<T> = {
  [K in keyof T]?: NonNullable<T[K]> extends EafLeaf
    ? EafRulesFor<NonNullable<T[K]>>
    : EafObjectRules<NonNullable<T[K]>>;
};

/**
 * @deprecated Use {@link EafRules} - it's the same type, now supporting
 * nested objects.
 */
export type RulesForFormData<T> = EafRules<T>;

// --- Default rules ---
export interface EafFormRuleRequired {
  required?: boolean | { message: string };
}

// --- Rules for numbers ---
export interface EafFormRuleRange {
  range?: {
    min?: number;
    max?: number;
    message: string;
  };
}

// --- Rules for strings ---
export interface EafFormRulePattern {
  pattern?: {
    regex: RegExp;
    message: string;
  };
}

export interface EafFormRuleLength {
  length?: {
    minLength?: number;
    maxLength?: number;
    message: string;
  };
}
