import { IfExtends } from "../internal";

export type EafRulesFor<V> = IfExtends<
  V,
  string,
  EafFormRuleLength & EafFormRulePattern
> &
  IfExtends<V, number, EafFormRuleRange> &
  EafFormRuleRequired;

export type RulesForFormData<T> = {
  [K in keyof T]?: EafRulesFor<NonNullable<T[K]>>;
};

// --- Default rules ---
export interface EafFormRuleRequired {
  required?: {
    required: boolean;
    message: string;
  };
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
