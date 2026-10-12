import { ref, reactive, watch, InjectionKey, inject } from "vue";
import { useI18n, type Composer } from "vue-i18n";
import type {
  EafFields,
  EafForm,
  EafFormApiErrorParser,
  EafFormConfig,
} from "../types";
import { cloneDeep } from "../utils/cloneDeep";
import { createFields, getByPath, hasPath, isPlainObject } from "../utils/path";
import { blankToUndefined, issuePath, schemaAt } from "../utils/schema";
import { exposeFormToAi } from "../ai-tools/formTools";

export const EAF_FORM_KEY: InjectionKey<EafFormApiErrorParser> = Symbol(
  "eaf:form-error-parser",
);

// Overridable via i18nConfig.messages, like any other shell translation.
const REQUIRED_MESSAGE_KEY = "validation.required";
const DEFAULT_REQUIRED_MESSAGE = "This field is required";

/** Every path in `value`: objects' keys, arrays and their items, nested ones too */
function fieldPaths(value: unknown, parentPath: string): string[] {
  const children: [string, unknown][] = Array.isArray(value)
    ? value.map((item, index) => [`${parentPath}[${index}]`, item])
    : isPlainObject(value)
      ? Object.entries(value).map(([key, child]) => [
          parentPath ? `${parentPath}.${key}` : key,
          child,
        ])
      : [];
  return children.flatMap(([path, child]) => [
    path,
    ...fieldPaths(child, path),
  ]);
}

/** A form: its values, checked by `schema`, and the schema's and the API's errors on its fields */
export function useEafForm<T extends object>({
  defaultValues,
  schema,
  onSubmit,
  validateOn = "blur",
  exposeToAi = true,
}: EafFormConfig<T>): EafForm<T> {
  const errorParser = inject(EAF_FORM_KEY, null);

  // null when no vue-i18n plugin is installed
  let t: Composer["t"] | null = null;
  try {
    ({ t } = useI18n({ useScope: "global" }));
  } catch {
    /* no-op */
  }

  // A copy: `defaultValues` stay as they are - for resetForm(), and the other
  // forms that may share them
  const data = reactive(cloneDeep(defaultValues));

  const fieldErrors = reactive(new Map<string, string[]>());
  const summaryErrors = ref<string[]>([]);
  const generalMessage = ref("");
  const loading = ref(false);

  /** Errors go on their fields - those of none, the whole form's ("") or a path the data lacks, in the summary */
  function showErrors(errors: Iterable<[string, string[]]>): void {
    for (const [path, messages] of errors) {
      if (path !== "" && hasPath(data, path) && messages.length > 0) {
        fieldErrors.set(path, messages);
      } else {
        summaryErrors.value.push(
          ...messages.map((message) =>
            path ? `${path}: ${message}` : message,
          ),
        );
      }
    }
  }

  /** Shows the error the `EAF_FORM_KEY` parser makes of `rawError`; `false` when it isn't one to show */
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

    clearErrors();
    generalMessage.value = response.generalMessage ?? "";
    if (response.traceId) {
      console.warn("[Validation Error]", {
        code: response.code,
        message: response.message,
        traceId: response.traceId,
      });
    }
    showErrors(Object.entries(response.validationErrors ?? {}));
    return true;
  }

  /**
   * The schema's errors by field path ("" for the whole form's). A field
   * missing a value gets the translated required message, unless the schema
   * gives its own.
   */
  function schemaErrors(): Map<string, string[]> {
    const errors = new Map<string, string[]>();
    if (schema === undefined) return errors;

    const result = schema.safeParse(blankToUndefined(data), {
      error: (issue) =>
        issue.code === "invalid_type" && issue.input === undefined
          ? (t?.(REQUIRED_MESSAGE_KEY) ?? DEFAULT_REQUIRED_MESSAGE)
          : undefined,
    });
    if (result.success) return errors;

    for (const issue of result.error.issues) {
      const path = issuePath(issue.path);
      errors.set(path, [...(errors.get(path) ?? []), issue.message]);
    }

    return errors;
  }

  // Fields left once, and whether validate() ran - their changes are checked from then on
  const touched = new Set<string>();
  let validated = false;

  /** Whether a change to the field at `path` checks it, see `validateOn` */
  function checksOnChange(path: string): boolean {
    return (
      validateOn === "change" ||
      validated ||
      touched.has(path) ||
      fieldErrors.has(path)
    );
  }

  /** Leaving the field: checks it - an error it already has, e.g. the API's, stays until it changes */
  function touch(path: string): void {
    // Not while submitting: its check ran, and inputs it disables lose focus
    if (validateOn !== "blur" || loading.value) {
      return;
    }
    touched.add(path);
    if (!fieldErrors.has(path)) {
      validateField(path);
    }
  }

  function validate(): boolean {
    clearErrors();
    validated = true;
    showErrors(schemaErrors());
    return !hasErrors();
  }

  async function submit(): Promise<void> {
    if (!validate()) {
      return;
    }

    loading.value = true;
    try {
      await onSubmit?.(data as T);
    } catch (error) {
      handleApiError(error);
    } finally {
      loading.value = false;
    }
  }

  const setFieldError = (path: string, messages: string | string[]) =>
    fieldErrors.set(path, [messages].flat());

  /** Whether the schema takes no empty value there, see `blankToUndefined` */
  function isFieldRequired(path: string): boolean {
    const field = schemaAt(schema, path);
    return field !== undefined && !field.safeParse(undefined).success;
  }

  function clearErrors(): void {
    fieldErrors.clear();
    summaryErrors.value = [];
    generalMessage.value = "";
  }

  /** Puts `newData` (default: `defaultValues`) into the form, unvalidated */
  function resetForm(newData: T = defaultValues): void {
    Object.assign(data, cloneDeep(newData));
    // After the assign, so it also drops what the change check found
    clearErrors();
    touched.clear();
    validated = false;
  }

  /** Sets or clears the errors of one field, as validate() would */
  function validateField(path: string, errors = schemaErrors()): void {
    const messages = errors.get(path);
    if (messages) {
      fieldErrors.set(path, messages);
    } else {
      fieldErrors.delete(path);
    }
  }

  // Checks the fields whose value changed, see `checksOnChange`; fields that
  // are gone lose their errors. `sync`, so resetForm() can clear what it triggers.
  if (validateOn !== "submit" && schema) {
    // Arrays by length: push/splice keep the reference, and the array's own
    // checks (e.g. `.min(1)`) only look at the length
    const snapshot = () =>
      new Map(
        fieldPaths(data, "").map((path) => {
          const value = getByPath(data, path);
          return [path, Array.isArray(value) ? value.length : value];
        }),
      );
    let last = snapshot();
    watch(
      data,
      () => {
        const current = snapshot();
        const errors = schemaErrors();

        for (const [path, value] of current) {
          if (
            last.has(path) &&
            !Object.is(last.get(path), value) &&
            checksOnChange(path)
          ) {
            validateField(path, errors);
          }
        }

        for (const path of last.keys()) {
          if (!current.has(path)) {
            fieldErrors.delete(path);
            touched.delete(path);
          }
        }
        last = current;
      },
      { flush: "sync" },
    );
  }

  if (exposeToAi !== false) {
    exposeFormToAi({
      data,
      errors: fieldErrors,
      isRequired: isFieldRequired,
      validate: (path) => validateField(path),
      schema,
      descriptions: exposeToAi,
    });
  }

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
      errors: (path) => fieldErrors.get(path) ?? [],
      isRequired: isFieldRequired,
      setErrors: setFieldError,
      clearErrors: (path) => fieldErrors.delete(path),
      touch,
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
