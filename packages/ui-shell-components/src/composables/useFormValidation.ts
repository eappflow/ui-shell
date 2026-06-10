import { ref } from "vue";

let counter = 0;

export function useId(): string {
  const id = ref<string>(`eaf-input-${++counter}`);
  return id.value;
}

export interface ValidationRule {
  (value: unknown): string | true;
}

export function useFormValidation() {
  const errors = ref<Record<string, string>>({});

  function validateField(field: string, value: unknown, rules: ValidationRule[]) {
    for (const rule of rules) {
      const result = rule(value);
      if (result !== true) {
        errors.value[field] = result;
        return false;
      }
    }
    delete errors.value[field];
    return true;
  }

  function clearErrors() {
    errors.value = {};
  }

  function hasErrors(): boolean {
    return Object.keys(errors.value).length > 0;
  }

  return { errors, validateField, clearErrors, hasErrors };
}

export const required = (message = "This field is required"): ValidationRule => {
  return (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return message;
    }
    return true;
  };
};

export const minLength = (min: number, message?: string): ValidationRule => {
  return (value: unknown) => {
    if (typeof value === "string" && value.length < min) {
      return message ?? `Must be at least ${min} characters`;
    }
    return true;
  };
};