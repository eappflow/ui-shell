import { computed, ref, reactive, watch, InjectionKey, inject } from "vue";
import { useI18n, type Composer } from "vue-i18n";
import { z } from "zod";
import type {
  EafFields,
  EafForm,
  EafFormApiErrorParser,
  EafFormConfig,
} from "../types";
import { cloneDeep } from "../utils/cloneDeep";
import { createFields, getByPath, hasPath, isPlainObject } from "../utils/path";
import {
  blanksToUnset,
  deriveDefaults,
  isBlank,
  isRequiredSchema,
  issuePath,
  schemaAt,
} from "../utils/schema";
import { exposeFormToAi } from "../ai-tools/formTools";

export const EAF_FORM_KEY: InjectionKey<EafFormApiErrorParser> = Symbol(
  "eaf:form-error-parser",
);

// Overridable via i18nConfig.messages, like any other shell translation.
const REQUIRED_MESSAGE_KEY = "validation.required";
const DEFAULT_REQUIRED_MESSAGE = "This field is required";
// zod's own messages for the other checks (too long, out of range...), in the
// app's languages - only these, so a host bundles no other locale
const ZOD_LOCALES = { en: z.locales.en, pl: z.locales.pl };

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
  let locale: Composer["locale"] | null = null;
  try {
    ({ t, locale } = useI18n({ useScope: "global" }));
  } catch {
    /* no-op */
  }

  // What a fresh form starts with: the schema's empty values (and any default it
  // declares), overridden by the caller's `defaultValues` - where a form-only
  // field, or one whose empty value differs from the schema, goes.
  const derived = schema ? deriveDefaults(schema) : undefined;
  const initialValues = {
    ...(isPlainObject(derived) ? derived : {}),
    ...(defaultValues ?? {}),
  } as T;

  // A copy: `initialValues` stay as they are - for resetForm(), and the other
  // forms that may share them
  const data = reactive(cloneDeep(initialValues));

  const fieldErrors = reactive(new Map<string, string[]>());
  // How many `EafFormItem`s show each field, see `$display`
  const displayed = reactive(new Map<string, number>());
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
   * The schema's errors by field path ("" for the whole form's). An empty
   * field (`isBlank`) gets the translated required message, the rest zod's
   * message in the app's language - unless the schema gives its own.
   */
  function schemaErrors(): Map<string, string[]> {
    const errors = new Map<string, string[]>();
    if (schema === undefined) return errors;

    const language = locale?.value.split("-")[0] as keyof typeof ZOD_LOCALES;
    const localeError = ZOD_LOCALES[language]?.().localeError;
    const result = schema.safeParse(blanksToUnset(schema, data), {
      error: (issue) =>
        isBlank(issue.input)
          ? (t?.(REQUIRED_MESSAGE_KEY) ?? DEFAULT_REQUIRED_MESSAGE)
          : localeError?.(issue),
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
      await onSubmit?.((schema ? blanksToUnset(schema, data) : data) as T);
    } catch (error) {
      handleApiError(error);
    } finally {
      loading.value = false;
    }
  }

  const setFieldError = (path: string, messages: string | string[]) =>
    fieldErrors.set(path, [messages].flat());

  /** Counts the field as shown until the returned function is called */
  function display(path: string): () => void {
    displayed.set(path, (displayed.get(path) ?? 0) + 1);
    let shown = true;
    return () => {
      if (!shown) return;
      shown = false;
      const count = (displayed.get(path) ?? 1) - 1;
      if (count > 0) displayed.set(path, count);
      else displayed.delete(path);
    };
  }

  const undisplayedErrors = computed(() =>
    [...fieldErrors]
      .filter(([path]) => !displayed.has(path))
      .flatMap(([path, messages]) =>
        messages.map((message) => `${path}: ${message}`),
      ),
  );

  /** Whether the schema takes no empty value there, see `isRequiredSchema` */
  function isFieldRequired(path: string): boolean {
    const field = schemaAt(schema, path);
    return field !== undefined && isRequiredSchema(field);
  }

  function clearErrors(): void {
    fieldErrors.clear();
    summaryErrors.value = [];
    generalMessage.value = "";
  }

  /**
   * Puts `newData` (default: the initial values) into the form, unvalidated -
   * over the initial values, so a field it lacks (a loaded record's `id`) doesn't
   * keep what the previous data put in
   */
  function resetForm(newData: T = initialValues): void {
    const values = cloneDeep({ ...initialValues, ...newData });
    for (const key of Object.keys(data)) {
      if (!Object.hasOwn(values, key)) {
        delete (data as Record<string, unknown>)[key];
      }
    }
    Object.assign(data, values);
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
      display,
    }) as EafFields<T>,
    loading,
    fieldErrors,
    summaryErrors,
    undisplayedErrors,
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
