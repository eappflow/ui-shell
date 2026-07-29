import type {
  EafFormRuleLength,
  EafFormRulePattern,
  EafFormRuleRange,
  EafFormRuleRequired,
} from "../types";

export type FieldRule = Partial<
  EafFormRuleRequired &
    EafFormRuleLength &
    EafFormRulePattern &
    EafFormRuleRange
>;

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === "";
}

const DEFAULT_REQUIRED_MESSAGE = "This field is required";

function validateRequired(
  value: unknown,
  rules: EafFormRuleRequired,
): string[] {
  const rule = rules.required;
  if (!rule || !isEmptyValue(value)) {
    return [];
  }
  const message =
    typeof rule === "object" ? rule.message : DEFAULT_REQUIRED_MESSAGE;
  return [message];
}

function validateLength(value: unknown, rules: EafFormRuleLength): string[] {
  const rule = rules.length;
  if (typeof value !== "string" || !rule) {
    return [];
  }

  const messages: string[] = [];
  if (rule.minLength !== undefined && value.length < rule.minLength) {
    messages.push(rule.message);
  }
  if (rule.maxLength !== undefined && value.length > rule.maxLength) {
    messages.push(rule.message);
  }
  return messages;
}

function validatePattern(value: unknown, rules: EafFormRulePattern): string[] {
  const rule = rules.pattern;
  if (typeof value !== "string" || !rule) {
    return [];
  }
  return rule.regex.test(value) ? [] : [rule.message];
}

function validateRange(value: unknown, rules: EafFormRuleRange): string[] {
  const rule = rules.range;
  if (typeof value !== "number" || !rule) {
    return [];
  }

  const messages: string[] = [];
  if (rule.min !== undefined && value < rule.min) {
    messages.push(rule.message);
  }
  if (rule.max !== undefined && value > rule.max) {
    messages.push(rule.message);
  }
  return messages;
}

/**
 * Checks a single field's value against its rules
 *
 * @returns Validation error messages for the field (empty if valid)
 */
export function getFieldViolations(value: unknown, rules: FieldRule): string[] {
  return [
    ...validateRequired(value, rules),
    ...validateLength(value, rules),
    ...validatePattern(value, rules),
    ...validateRange(value, rules),
  ];
}
