import { getCurrentScope, onScopeDispose } from "vue";
import { z } from "zod";
import type { EafAiTool } from "../types";
import { defineEafAiTool } from "./defineEafAiTool";
import { getByPath, hasPath, isPlainObject, setByPath } from "../utils/path";
import { isBlank, issuePath, schemaAt } from "../utils/schema";

/** What the AI tools need of a `useEafForm` */
interface AiForm {
  data: object;
  errors: ReadonlyMap<string, string[]>;
  isRequired: (path: string) => boolean;
  /** Sets or clears the field's errors, as the form's own check would */
  validate: (path: string) => void;
  /** `useEafForm`'s `schema` - what the values must be */
  schema: z.ZodType | undefined;
  /** `useEafForm`'s `exposeToAi`, when it describes the form, see `EafAiDescriptions` */
  descriptions: unknown;
}

// Numbered in the order they appear, so the model can tell them apart
const forms = new Map<number, AiForm>();
let lastNumber = 0;

/** Shows `form` to the AI tools until the calling component unmounts */
export function exposeFormToAi(form: AiForm): void {
  // Outside a component nothing would take it back out
  if (!getCurrentScope()) {
    return;
  }
  const number = ++lastNumber;
  forms.set(number, form);
  onScopeDispose(() => forms.delete(number));
}

/** `{ a: { b: 1 }, items: [{ n: "x" }] }` → `a.b`, `items[0].n` */
function leafPaths(value: unknown, path: string): string[] {
  if (isPlainObject(value) && Object.keys(value).length > 0) {
    return Object.entries(value).flatMap(([key, child]) =>
      leafPaths(child, path ? `${path}.${key}` : key),
    );
  }
  if (Array.isArray(value) && value.some(isPlainObject)) {
    return value.flatMap((item, index) => leafPaths(item, `${path}[${index}]`));
  }
  return path ? [path] : [];
}

/** `{ $description: "f", a: { b: "x" }, items: { $each: { n: "y" } } }` → `"": f`, `a.b: x`, `items[].n: y` */
function descriptionPaths(node: unknown, path: string): [string, string][] {
  if (typeof node === "string") {
    return [[path, node]];
  }
  if (!isPlainObject(node)) {
    return [];
  }
  return Object.entries(node).flatMap(([key, child]) => {
    if (key === "$description") return descriptionPaths(child, path);
    if (key === "$each") return descriptionPaths(child, `${path}[]`);
    return descriptionPaths(child, path ? `${path}.${key}` : key);
  });
}

function describeForm(number: number, form: AiForm) {
  const { "": description, ...descriptions } = Object.fromEntries(
    descriptionPaths(form.descriptions, ""),
  );
  return {
    form: number,
    ...(description && { description }),
    ...(Object.keys(descriptions).length > 0 && { descriptions }),
    fields: leafPaths(form.data, "").map((path) => ({
      path,
      value: getByPath(form.data, path),
      ...(form.isRequired(path) && { required: true }),
    })),
    ...(form.errors.size > 0 && { errors: Object.fromEntries(form.errors) }),
  };
}

// Breaking a check (too short, wrong format...) is fine: the value goes in and
// the form shows the error. A wrong type or an unknown option would break the
// form's inputs - an empty value is a missing one, see `isBlank`.
const isWrongType = (issue: z.core.$ZodIssue) =>
  !isBlank(issue.input) &&
  [
    "invalid_type",
    "invalid_value",
    "invalid_union",
    "unrecognized_keys",
  ].includes(issue.code);

/** Why `value` can't go in the field at `path`, by the form's schema; `undefined` when it can */
function wrongType(
  form: AiForm,
  path: string,
  value: unknown,
): string | undefined {
  const issues =
    schemaAt(form.schema, path)
      ?.safeParse(value, { reportInput: true })
      .error?.issues.filter(isWrongType) ?? [];
  if (issues.length === 0) {
    return undefined;
  }
  return issues
    .map((issue) => `${issuePath([path, ...issue.path])}: ${issue.message}`)
    .join(" ");
}

function fillForm(number: number, values: Record<string, unknown>) {
  const form = forms.get(number);
  if (!form) {
    throw new Error(`There is no form ${number} on the screen now.`);
  }

  const notFilled: Record<string, string> = {};
  for (const [path, value] of Object.entries(values)) {
    if (!hasPath(form.data, path)) {
      notFilled[path] = "There is no such field.";
      continue;
    }
    // JSON has no dates.
    // ponytail: only a date field's own path - dates inside a list item set at
    // once fail the schema's check, and the model sets them by path instead
    const next =
      getByPath(form.data, path) instanceof Date && typeof value === "string"
        ? new Date(value)
        : value;
    // ponytail: without a schema any value goes in
    const wrong = wrongType(form, path, next);
    if (wrong) {
      notFilled[path] = wrong;
      continue;
    }
    setByPath(form.data, path, next);
    // The form checks the fields that changed; new array items' fields are
    // checked here, so the model sees what is wrong with what it added
    leafPaths(next, path).forEach(form.validate);
  }

  return {
    ...describeForm(number, form),
    ...(Object.keys(notFilled).length > 0 && { notFilled }),
  };
}

const getFormsTool = defineEafAiTool({
  name: "get_forms",
  description:
    "Lists the forms on the user's screen with each field's path, current value and whether it is " +
    "required, plus the form's validation errors - and, when given, what the form and its fields are " +
    "for (descriptions by path, items[].name meaning every item's name). You are only offered it while the user has a form " +
    "open - so when they ask to add, create or change something, check whether an open form is for " +
    "it and fill it in (fill_form) for them to review, rather than asking first.",
  run: () => [...forms].map(([number, form]) => describeForm(number, form)),
});

const fillFormTool = defineEafAiTool({
  name: "fill_form",
  description:
    "Puts values into fields of a form on the user's screen (see get_forms). The user reviews and " +
    "submits the form - it is never submitted for them. Returns the form as it is afterwards, with the " +
    "validation errors and the fields that could not be filled. A value must have the field's type; " +
    "dates go as ISO 8601 strings, each by its own path. Set a list by replacing its whole array, which " +
    "overwrites the items there (each new item with all the fields the listed ones have); a path like " +
    "items[0].name changes only that item.",
  parameters: z.object({
    form: z.int().describe("The form's number from get_forms."),
    values: z
      .record(z.string(), z.unknown())
      .describe(
        'New values by field path, e.g. {"name": "Anna", "address.city": "Kraków", "items[0].quantity": 2}.',
      ),
  }),
  run: ({ form, values }) => fillForm(form, values),
});

/** The AI chat's tools for the forms on screen - none while there are none */
export function eafFormTools(): EafAiTool[] {
  return forms.size > 0 ? [getFormsTool, fillFormTool] : [];
}
