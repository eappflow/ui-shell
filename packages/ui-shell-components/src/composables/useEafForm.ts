import { ref, reactive, watch, InjectionKey, inject } from "vue";
import { useI18n, type Composer } from "vue-i18n";
import type {
  EafFields,
  EafForm,
  EafFormApiErrorParser,
  EafFormConfig,
} from "../types";
import {
  getFieldViolations,
  type FieldRule,
} from "../validators/fieldValidators";
import { cloneDeep } from "../utils/cloneDeep";
import { createFields, getByPath, hasPath, isPlainObject } from "../utils/path";

export const EAF_FORM_KEY: InjectionKey<EafFormApiErrorParser> = Symbol(
  "eaf:form-error-parser",
);

// Overridable via i18nConfig.messages, like any other shell translation.
const REQUIRED_MESSAGE_KEY = "validation.required";

/**
 * Composable for handling form validation errors from API responses
 * and client-side validation errors
 *
 * @param config Form data and validation rules
 * @returns Validation state and helper functions
 */
export function useEafForm<T extends object>(
  config: EafFormConfig<T>,
): EafForm<T> {
  const errorParser = inject(EAF_FORM_KEY, null);

  // null when no vue-i18n plugin is installed
  let t: Composer["t"] | null = null;
  try {
    ({ t } = useI18n({ useScope: "global" }));
  } catch {
    /* no-op */
  }

  const data = reactive(config.data);
  const initialData: T = cloneDeep(config.data);

  // Reactive validation state
  const fieldErrors = reactive(new Map<string, string[]>());
  const summaryErrors = ref<string[]>([]);
  const generalMessage = ref<string>("");
  const loading = ref(false);

  /**
   * Handles API error responses that the errorParser marks as validation
   * errors to handle (response.handleErrors)
   * Extracts validation errors and maps them to form fields
   *
   * @param error The error object from the API call (typically from axios)
   * @returns true if error was handled as validation error, false otherwise
   */
  function handleApiError(rawError: unknown): boolean {
    if (errorParser === null) {
      console.warn(
        "[useEafForm] No error parser provided. Please provide an error parser using EAF_FORM_KEY injection.",
      );
      return false;
    }

    const response = errorParser(rawError);

    if (response.handleErrors === false) {
      return false;
    }

    // Clear previous errors
    clearErrors();

    // Extract general message
    if (response?.generalMessage) {
      generalMessage.value = response.generalMessage;
    }

    // Log traceId for debugging
    if (response?.traceId) {
      console.warn("[Validation Error]", {
        code: response.code,
        message: response.message,
        traceId: response.traceId,
      });
    }

    // Process validation errors
    if (response?.validationErrors) {
      const unmatchedErrors: string[] = [];

      Object.entries(response.validationErrors).forEach(
        ([fieldName, messages]) => {
          const isRegistered = hasPath(data, fieldName);

          if (isRegistered && messages.length > 0) {
            // Map to form field
            fieldErrors.set(fieldName, messages);
          } else {
            // Field not registered, add to summary
            messages.forEach((msg) => {
              unmatchedErrors.push(`${fieldName}: ${msg}`);
            });
          }
        },
      );

      summaryErrors.value = unmatchedErrors;
    }

    return true;
  }

  function validate(): boolean {
    clearErrors();

    const rules = config.rules;
    if (!rules) {
      return true;
    }

    validateRules(data, rules as Record<string, unknown>, "");

    return !hasErrors();
  }

  function validateRules(
    values: unknown,
    rules: Record<string, unknown>,
    parentPath: string,
  ): void {
    for (const key of Object.keys(rules)) {
      if (key.startsWith("$")) {
        continue;
      }

      const fieldRules = rules[key];
      if (!isPlainObject(fieldRules)) {
        continue;
      }

      const path = parentPath === "" ? key : `${parentPath}.${key}`;
      const value =
        values !== null && typeof values === "object"
          ? (values as Record<string, unknown>)[key]
          : undefined;

      validateNode(value, fieldRules, path);
    }
  }

  /** Checks a value: an object's children, or the value (+ array items) */
  function validateNode(
    value: unknown,
    nodeRules: Record<string, unknown>,
    path: string,
  ): void {
    if (isPlainObject(value)) {
      validateRules(value, nodeRules, path);
      return;
    }

    const messages = getFieldViolations(
      value,
      withTranslatedRequiredMessage(nodeRules as FieldRule),
    );
    if (messages.length > 0) {
      setFieldError(path, messages);
    }

    const each = nodeRules.$each;
    if (Array.isArray(value) && isPlainObject(each)) {
      value.forEach((item, index) =>
        validateNode(item, each, `${path}[${index}]`),
      );
    }
  }

  function withTranslatedRequiredMessage(fieldRules: FieldRule): FieldRule {
    return fieldRules.$required === true && t
      ? { ...fieldRules, $required: { message: t(REQUIRED_MESSAGE_KEY) } }
      : fieldRules;
  }

  async function submit(
    handleSubmit: (data: T) => Promise<void>,
  ): Promise<void> {
    if (!validate()) {
      return;
    }

    loading.value = true;
    try {
      await handleSubmit(data as T);
    } catch (error) {
      handleApiError(error);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Sets validation error(s) for a specific field (client-side validation)
   *
   * @param fieldName The field name (camelCase)
   * @param messages Error message(s) - can be a single string or array
   */
  function setFieldError(fieldName: string, messages: string | string[]): void {
    const errorArray = Array.isArray(messages) ? messages : [messages];
    fieldErrors.set(fieldName, errorArray);
  }

  /**
   * Gets all error messages for a specific field (regardless of config)
   *
   * @param fieldName The field name (camelCase)
   * @returns Array of all error messages for the field, or empty array if none
   */
  function getAllFieldErrors(fieldName: string): string[] {
    return fieldErrors.get(fieldName) || [];
  }

  /** `items[0].name` → rules at `items.$each.name` */
  function rulesAt(path: string): unknown {
    return getByPath(
      config.rules,
      path.replace(/\[\d+\]/g, () => ".$each"),
    );
  }

  function isFieldRequired(path: string): boolean {
    const fieldRules = rulesAt(path);
    return isPlainObject(fieldRules) && Boolean(fieldRules.$required);
  }

  /**
   * Clears all validation errors (field-level, summary, and general message)
   */
  function clearErrors(): void {
    fieldErrors.clear();
    summaryErrors.value = [];
    generalMessage.value = "";
  }

  /**
   * Clears validation errors for a specific field
   *
   * @param fieldName The field name (camelCase)
   */
  function clearFieldError(fieldName: string): void {
    fieldErrors.delete(fieldName);
  }

  /** Puts `newData` (default: the initial data) into the form, unvalidated */
  function resetForm(newData: T = initialData): void {
    Object.assign(data, cloneDeep(newData));
    // After the assign, so it also drops what the change check found
    clearErrors();
  }

  /** Sets or clears the errors of one field, as validate() would */
  function validateField(path: string): void {
    const fieldRules = rulesAt(path);
    const value = getByPath(data, path);
    const messages =
      hasPath(data, path) && isPlainObject(fieldRules) && !isPlainObject(value)
        ? getFieldViolations(
            value,
            withTranslatedRequiredMessage(fieldRules as FieldRule),
          )
        : [];
    if (messages.length > 0) {
      setFieldError(path, messages);
    } else {
      clearFieldError(path);
    }
  }

  /** Data paths that have rules, walked like validate() */
  function ruledPaths(
    value: unknown,
    nodeRules: Record<string, unknown>,
    parentPath: string,
  ): string[] {
    if (Array.isArray(value)) {
      const each = nodeRules.$each;
      return isPlainObject(each)
        ? value.flatMap((item, index) => {
            const path = `${parentPath}[${index}]`;
            return [path, ...ruledPaths(item, each, path)];
          })
        : [];
    }
    if (!isPlainObject(value)) {
      return [];
    }
    return Object.entries(nodeRules).flatMap(([key, childRules]) => {
      if (
        key.startsWith("$") ||
        !isPlainObject(childRules) ||
        !(key in value)
      ) {
        return [];
      }
      const path = parentPath === "" ? key : `${parentPath}.${key}`;
      return [path, ...ruledPaths(value[key], childRules, path)];
    });
  }

  // Checks each field whose value changed; fields that are gone lose their
  // errors. `sync`, so resetForm() can clear what it triggers.
  if (config.validateOnChange !== false && config.rules) {
    const rules = config.rules as Record<string, unknown>;
    // Arrays by length: push/splice keep the reference, and an array's own
    // rules (`$required`, `$length`) only look at the length
    const snapshot = () =>
      new Map(
        ruledPaths(data, rules, "").map((path) => {
          const value = getByPath(data, path);
          return [path, Array.isArray(value) ? value.length : value];
        }),
      );
    let last = snapshot();
    watch(
      data,
      () => {
        const current = snapshot();

        for (const [path, value] of current) {
          if (last.has(path) && !Object.is(last.get(path), value)) {
            validateField(path);
          }
        }

        for (const path of last.keys()) {
          if (!current.has(path)) {
            clearFieldError(path);
          }
        }
        last = current;
      },
      { flush: "sync" },
    );
  }

  /**
   * Checks if there are any validation errors present
   *
   * @returns true if any errors exist (field, summary, or general), false otherwise
   */
  function hasErrors(): boolean {
    return (
      fieldErrors.size > 0 ||
      summaryErrors.value.length > 0 ||
      generalMessage.value !== ""
    );
  }

  return {
    // Reactive state
    data,
    fields: createFields({
      errors: getAllFieldErrors,
      isRequired: isFieldRequired,
      setErrors: setFieldError,
      clearErrors: clearFieldError,
    }) as EafFields<T>,
    loading,
    fieldErrors,
    summaryErrors,
    generalMessage,

    // Helper functions
    submit,
    validate,
    resetForm,
    handleApiError,
    clearErrors,
    hasErrors,
  };
}
