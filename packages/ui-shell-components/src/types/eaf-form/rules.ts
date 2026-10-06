import { IfExtends } from "../internal";
import type { EafLeaf } from "./fields";

export type EafRulesFor<V> = IfExtends<
  V,
  string,
  EafFormRuleLength & EafFormRulePattern
> &
  IfExtends<V, number, EafFormRuleRange> &
  EafFormRuleRequired;

/** Object rules: its own `$required` plus its children's rules */
export type EafObjectRules<T> = EafFormRuleRequired & EafRules<T>;

/**
 * Array rules: `$required`, `$length` (item count) and `$each`, the rules of
 * every item
 */
export type EafArrayRules<E> = EafFormRuleRequired &
  EafFormRuleLength & {
    $each?: EafRulesOf<NonNullable<E>>;
  };

/** Rules of a value `V` */
export type EafRulesOf<V> = V extends readonly (infer E)[]
  ? EafArrayRules<E>
  : V extends EafLeaf
    ? EafRulesFor<V>
    : EafObjectRules<V>;

/** Rules mirroring the data `T`; a `null` object only checks its `$required` */
export type EafRules<T> = {
  [K in keyof T]?: EafRulesOf<NonNullable<T[K]>>;
};

// --- Default rules ---
export interface EafFormRuleRequired {
  $required?: boolean | { message: string };
}

// --- Rules for numbers ---
export interface EafFormRuleRange {
  $range?: {
    min?: number;
    max?: number;
    message: string;
  };
}

// --- Rules for strings ---
export interface EafFormRulePattern {
  $pattern?: {
    regex: RegExp;
    message: string;
  };
}

export interface EafFormRuleLength {
  $length?: {
    minLength?: number;
    maxLength?: number;
    message: string;
  };
}
