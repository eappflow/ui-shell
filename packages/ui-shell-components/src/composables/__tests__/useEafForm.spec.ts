import { describe, it, expect, expectTypeOf, vi, afterEach } from "vitest";
import { reactive } from "vue";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { z } from "zod";
import { useEafForm, EAF_FORM_KEY } from "../useEafForm";
import { deriveDefaults } from "../../utils/schema";
import type {
  ApiParsedErrorResponse,
  EafForm,
  EafFormConfig,
  EafFormApiErrorParser,
} from "../../types";

interface TestForm {
  firstName: string;
  age: number;
  email: string;
}

const schema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .min(2, "First name must be 2-10 characters")
    .max(10, "First name must be 2-10 characters"),
  age: z
    .number()
    .min(18, "Age must be between 18 and 65")
    .max(65, "Age must be between 18 and 65")
    .optional(),
  // Empty, or an email address
  email: z
    .string()
    .regex(/^$|^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"),
});

function withSetup<T>(
  composable: () => T,
  provideMap: Record<string | symbol, unknown> = {},
) {
  let result!: T;
  const wrapper = mount(
    {
      setup() {
        result = composable();
        return () => null;
      },
    },
    {
      global: {
        provide: provideMap,
      },
    },
  );
  return { result, wrapper };
}

function createForm(data: Partial<TestForm> = {}) {
  const { result } = withSetup(() =>
    useEafForm({
      defaultValues: reactive({ firstName: "", age: 0, email: "", ...data }),
      schema,
    }),
  );
  return result;
}

const validData: TestForm = { firstName: "Jakub", age: 30, email: "a@b.com" };

describe("useEafForm - schema validation", () => {
  it("fails validation and surfaces the schema's message for an invalid field", () => {
    const $f = createForm({ ...validData, firstName: "" });

    expect($f.validate()).toBe(false);
    expect($f.fields.firstName.$error).toBe("First name is required");
  });

  it("passes validation when every field satisfies the schema", () => {
    const $f = createForm(validData);

    expect($f.validate()).toBe(true);
    expect($f.fields.firstName.$error).toBeUndefined();
    expect($f.fields.age.$error).toBeUndefined();
    expect($f.fields.email.$error).toBeUndefined();
  });

  it("collects violations from multiple fields at once", () => {
    const $f = createForm({ firstName: "", age: 5, email: "bad" });

    expect($f.validate()).toBe(false);
    expect($f.fields.firstName.$error).toBeDefined();
    expect($f.fields.age.$error).toBeDefined();
    expect($f.fields.email.$error).toBeDefined();
  });
});

describe("useEafForm - required fields", () => {
  it("requires what the schema takes no empty value for - '' and null may stay where it takes them", () => {
    interface RequiredForm {
      name: string;
      note: string;
      personId: string | null;
      signedOn: string | null;
    }
    const { result: $f } = withSetup(() =>
      useEafForm<RequiredForm>({
        defaultValues: {
          name: "",
          note: "",
          personId: null,
          signedOn: null,
        },
        schema: z.object({
          name: z.string().min(1),
          note: z.string(),
          personId: z.string(),
          signedOn: z.string().nullable(),
        }),
      }),
    );

    expect($f.validate()).toBe(false);
    expect([...$f.fieldErrors.keys()]).toEqual(["name", "personId"]);
    expect($f.fields.name.$error).toBe("This field is required");
    expect($f.fields.personId.$error).toBe("This field is required");
    expect($f.fields.name.$required).toBe(true);
    expect($f.fields.note.$required).toBe(false);
    expect($f.fields.signedOn.$required).toBe(false);
  });
});

describe("useEafForm - empty values on submit", () => {
  it("sends what is empty as null where the schema takes null, leaving data as it is", async () => {
    const onSubmit = vi.fn();
    const address = { city: "", street: "" };
    const { result: $f } = withSetup(() =>
      useEafForm({
        defaultValues: {
          name: "Jan",
          note: "",
          email: "",
          homeAddress: address,
          workAddress: { city: "Kraków", street: "" },
          phones: [{ number: "" }],
        },
        schema: z.object({
          name: z.string().min(1),
          note: z.string(),
          email: z.string().nullish(),
          homeAddress: z
            .object({ city: z.string(), street: z.string() })
            .nullish(),
          workAddress: z
            .object({ city: z.string(), street: z.string().nullable() })
            .nullable(),
          phones: z.array(z.object({ number: z.string().nullable() })),
        }),
        onSubmit,
      }),
    );

    await $f.submit();

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Jan",
      note: "",
      email: null,
      homeAddress: null,
      workAddress: { city: "Kraków", street: null },
      phones: [{ number: null }],
    });
    expect($f.data.email).toBe("");
    expect($f.data.homeAddress).toEqual(address);
  });
});

describe("useEafForm - a schema taking null for a sub-object", () => {
  it("fits a form that always holds the sub-object, which goes out as null once left empty", async () => {
    // The API's: the address is optional, and when given its fields are required
    const schema = z.object({
      name: z.string().min(1),
      address: z.object({ city: z.string().min(1) }).nullish(),
    });
    const onSubmit = vi.fn();
    const { result: $f } = withSetup(() =>
      useEafForm<{ name: string; address: { city: string } }>({
        defaultValues: { name: "Jan", address: { city: "" } },
        schema,
        onSubmit,
      }),
    );

    await $f.submit();
    expect(onSubmit).toHaveBeenCalledWith({ name: "Jan", address: null });

    $f.data.address.city = "K";
    $f.data.name = "";
    expect($f.validate()).toBe(false);
    expect([...$f.fieldErrors.keys()]).toEqual(["name"]);
  });
});

describe("useEafForm - a schema with optional fields", () => {
  it("leaves empty optional fields out, and sends empty nullable ones as null", async () => {
    const schema = z.object({
      note: z.string().optional(),
      signedOn: z.date().optional(),
      comment: z.string().nullable(),
    });
    const onSubmit = vi.fn();
    const { result: $f } = withSetup(() => useEafForm({ schema, onSubmit }));

    await $f.submit();
    // A cleared input too
    $f.data.note = "x";
    $f.data.note = "";
    await $f.submit();

    expect(onSubmit).toHaveBeenCalledTimes(2);
    for (const [values] of onSubmit.mock.calls) {
      expect(JSON.stringify(values)).toBe('{"comment":null}');
    }
  });
});

describe("useEafForm - required message", () => {
  it("falls back to a hardcoded message when no vue-i18n plugin is installed", () => {
    const { result: $f } = withSetup(() =>
      useEafForm({
        defaultValues: reactive({ firstName: "" }),
        schema: z.object({ firstName: z.string().min(1) }),
      }),
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.firstName.$error).toBe("This field is required");
  });

  it("uses the app's global vue-i18n translation when the plugin is installed", () => {
    const i18n = createI18n({
      legacy: false,
      locale: "pl",
      messages: {
        pl: { validation: { required: "To pole jest wymagane" } },
      },
    });

    let $f!: EafForm<{ firstName: string }>;
    mount(
      {
        setup() {
          $f = useEafForm({
            defaultValues: reactive({ firstName: "" }),
            schema: z.object({ firstName: z.string().min(1) }),
          });
          return () => null;
        },
      },
      { global: { plugins: [i18n] } },
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.firstName.$error).toBe("To pole jest wymagane");
  });

  it("gives the other checks zod's message in the app's language, following a switch", () => {
    const i18n = createI18n({
      legacy: false,
      locale: "pl",
      messages: { pl: {}, en: {} },
    });

    let $f!: EafForm<{ name: string }>;
    mount(
      {
        setup() {
          $f = useEafForm({
            defaultValues: reactive({ name: "abcdef" }),
            schema: z.object({ name: z.string().max(3) }),
          });
          return () => null;
        },
      },
      { global: { plugins: [i18n] } },
    );

    $f.validate();
    expect($f.fields.name.$error).toMatch(/^Za duża wartość/);

    i18n.global.locale.value = "en";
    $f.validate();
    expect($f.fields.name.$error).toMatch(/^Too big/);
  });
});

describe("useEafForm - resetForm", () => {
  it("restores data to the values the form was created with", () => {
    const $f = createForm(validData);

    $f.data.firstName = "Changed";
    $f.data.age = 99;
    $f.data.email = "changed@example.com";

    $f.resetForm();

    expect($f.data.firstName).toBe("Jakub");
    expect($f.data.age).toBe(30);
    expect($f.data.email).toBe("a@b.com");
  });

  it("clears field errors", () => {
    const $f = createForm(validData);
    $f.fields.firstName.$setError("Some client-side error");

    $f.resetForm();

    expect($f.fields.firstName.$error).toBeUndefined();
  });

  it("clears summary errors and the general message", () => {
    const parser: EafFormApiErrorParser = (error) =>
      error as ApiParsedErrorResponse;
    const { result: $f } = withSetup(
      () => useEafForm<TestForm>({ defaultValues: reactive({ ...validData }) }),
      { [EAF_FORM_KEY]: parser },
    );
    $f.handleApiError({
      status: 422,
      success: false,
      generalMessage: "Please fix the errors below",
      validationErrors: { someServerOnlyField: ["Some business rule"] },
    });

    $f.resetForm();

    expect($f.summaryErrors.value).toEqual([]);
    expect($f.generalMessage.value).toBe("");
  });

  it("drops what the previous data put in that the new data lacks - a loaded record's id", () => {
    interface Form {
      name: string;
      id?: string;
    }
    const { result: $f } = withSetup(() =>
      useEafForm<Form>({ schema: z.object({ name: z.string() }) }),
    );

    $f.resetForm({ name: "Loaded", id: "a" });
    $f.resetForm();

    expect($f.data).toEqual({ name: "" });
  });
});

describe("useEafForm - handleApiError with an injected parser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createFormWithParser(parser: EafFormApiErrorParser) {
    const { result } = withSetup(
      () =>
        useEafForm<TestForm>({
          defaultValues: reactive({ firstName: "", age: 0, email: "" }),
        }),
      { [EAF_FORM_KEY]: parser },
    );
    return result;
  }

  it("maps a registered field's validation error onto fieldErrors", () => {
    const parser: EafFormApiErrorParser = (error) =>
      error as ApiParsedErrorResponse;
    const $f = createFormWithParser(parser);

    const handled = $f.handleApiError({
      status: 422,
      success: false,
      validationErrors: {
        firstName: ["First name is already taken"],
      },
    });

    expect(handled).toBe(true);
    expect($f.fields.firstName.$error).toBe("First name is already taken");
  });

  it("puts an unregistered field's errors into summaryErrors instead", () => {
    const parser: EafFormApiErrorParser = (error) =>
      error as ApiParsedErrorResponse;
    const $f = createFormWithParser(parser);

    $f.handleApiError({
      status: 422,
      success: false,
      validationErrors: {
        someServerOnlyField: ["Some business rule was violated"],
      },
    });

    expect($f.summaryErrors.value).toEqual([
      "someServerOnlyField: Some business rule was violated",
    ]);
    expect($f.fieldErrors.has("someServerOnlyField")).toBe(false);
  });

  it("sets generalMessage from the parsed response", () => {
    const parser: EafFormApiErrorParser = (error) =>
      error as ApiParsedErrorResponse;
    const $f = createFormWithParser(parser);

    $f.handleApiError({
      status: 422,
      success: false,
      generalMessage: "Please fix the errors below",
    });

    expect($f.generalMessage.value).toBe("Please fix the errors below");
  });

  it("ignores errors the parser marks as handleErrors: false", () => {
    const parser: EafFormApiErrorParser = (error) =>
      error as ApiParsedErrorResponse;
    const $f = createFormWithParser(parser);
    $f.fields.firstName.$setError("pre-existing error");

    const handled = $f.handleApiError({
      status: 500,
      success: false,
      handleErrors: false,
    });

    expect(handled).toBe(false);
    // Existing state must be left untouched when the error isn't handled
    expect($f.fields.firstName.$error).toBe("pre-existing error");
  });

  it("warns and treats the raw error as unhandled when no parser is provided", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { result: $f } = withSetup(() =>
      useEafForm<TestForm>({
        defaultValues: reactive({ firstName: "", age: 0, email: "" }),
      }),
    );

    const handled = $f.handleApiError(new Error("network exploded"));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("No error parser provided"),
    );
    expect(handled).toBe(false);
  });
});

// ─── Nested data ────────────────────────────────────────────────────────────

const nestedSchema = z.object({
  name: z.string().min(1),
  address: z.object(
    {
      street: z
        .string()
        .min(1, "Street is required")
        .max(5, "Street is too long"),
      city: z.string().min(1),
    },
    "Address is required",
  ),
  dimensions: z
    .object({
      length: z.number().min(1, "Length must be positive").optional(),
      width: z.number().optional(),
    })
    .optional(),
  tags: z.array(z.string()),
  items: z.array(z.object({ name: z.string().optional() })),
});

// Held as `null` until there is one - which the schema requires
type NestedForm = Omit<z.input<typeof nestedSchema>, "address"> & {
  address: z.input<typeof nestedSchema>["address"] | null;
};

function nestedData(overrides: Partial<NestedForm> = {}): NestedForm {
  return {
    name: "Unit",
    address: { street: "Main", city: "Kraków" },
    dimensions: { length: 2, width: 3 },
    tags: ["a"],
    items: [{ name: "first" }],
    ...overrides,
  };
}

function createNestedForm(
  data: NestedForm = nestedData(),
  options: {
    schema?: z.ZodType<unknown, NestedForm>;
    validateOn?: EafFormConfig<NestedForm>["validateOn"];
  } = {},
  provideMap: Record<string | symbol, unknown> = {},
) {
  const { result } = withSetup(
    () =>
      useEafForm<NestedForm>({
        // Each change checked, so tests needn't leave fields first
        validateOn: "change",
        ...options,
        defaultValues: data,
        schema: options.schema ?? nestedSchema,
      }),
    provideMap,
  );
  return result;
}

const identityParser: EafFormApiErrorParser = (error) =>
  error as ApiParsedErrorResponse;

describe("useEafForm - nested schema validation", () => {
  it("passes when every nested field satisfies the schema", () => {
    const $f = createNestedForm();

    expect($f.validate()).toBe(true);
    expect($f.fieldErrors.size).toBe(0);
  });

  it("keys nested violations by dot path", () => {
    const $f = createNestedForm(
      nestedData({ address: { street: "", city: "" } }),
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.address.street.$error).toBe("Street is required");
    expect($f.fields.address.city.$error).toBe("This field is required");
    expect($f.fields.address.$error).toBeUndefined();
  });

  it("applies the checks (max length) to nested fields", () => {
    const $f = createNestedForm(
      nestedData({ address: { street: "Too long street", city: "X" } }),
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.address.street.$errors).toEqual(["Street is too long"]);
  });

  it("checks a nested number field (dimensions.length)", () => {
    const $f = createNestedForm(
      nestedData({ dimensions: { length: 0, width: 3 } }),
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.dimensions.length.$error).toBe("Length must be positive");
  });

  it("gives nested fields the translated required message", () => {
    const i18n = createI18n({
      legacy: false,
      locale: "pl",
      messages: { pl: { validation: { required: "To pole jest wymagane" } } },
    });

    let $f!: EafForm<NestedForm>;
    mount(
      {
        setup() {
          $f = useEafForm<NestedForm>({
            defaultValues: nestedData({
              address: { street: "Main", city: "" },
            }),
            schema: nestedSchema,
          });
          return () => null;
        },
      },
      { global: { plugins: [i18n] } },
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.address.city.$error).toBe("To pole jest wymagane");
  });

  describe("missing (null/undefined) sub-object", () => {
    it("required: reports the error on the object path and skips its children", () => {
      const $f = createNestedForm(nestedData({ address: null }));

      expect($f.validate()).toBe(false);
      expect($f.fields.address.$error).toBe("Address is required");
      expect($f.fields.address.street.$error).toBeUndefined();
      expect($f.fields.address.city.$error).toBeUndefined();
      expect($f.fields.address.$error).toBe("Address is required");
    });

    it("optional: skips the whole sub-object", () => {
      const { result: $f } = withSetup(() =>
        useEafForm({
          defaultValues: { dimensions: undefined },
          schema: z.object({
            dimensions: z
              .object({ length: z.number().min(1, "Length must be positive") })
              .optional(),
          }),
        }),
      );

      expect($f.validate()).toBe(true);
      expect($f.fieldErrors.size).toBe(0);
    });

    it("optional and null: its required children are skipped too", () => {
      const { result: $f } = withSetup(() =>
        useEafForm({
          defaultValues: { address: null },
          schema: z.object({
            address: z.object({ street: z.string() }).nullable().optional(),
          }),
        }),
      );

      expect($f.validate()).toBe(true);
    });
  });

  it("takes an empty array as a value, not a missing one", () => {
    const { result: $f } = withSetup(() =>
      useEafForm({
        defaultValues: { tags: [] },
        schema: z.object({ tags: z.array(z.string()) }),
      }),
    );

    expect($f.validate()).toBe(true);
  });

  it("puts the errors of the whole form, and of paths the data lacks, in the summary", () => {
    const whole = createNestedForm(nestedData({ name: "Kraków" }), {
      schema: nestedSchema.refine(
        (data) => data.name !== data.address?.city,
        "Name is the city",
      ),
    });
    // Every field the schema declares is derived into the form now, so a path
    // the data lacks has to be one the schema only names in an issue
    const lacking = createNestedForm(nestedData(), {
      schema: nestedSchema.superRefine((_, ctx) => {
        ctx.addIssue({
          code: "custom",
          message: "This field is required",
          path: ["nickname"],
        });
      }),
    });

    expect(whole.validate()).toBe(false);
    expect(whole.summaryErrors.value).toEqual(["Name is the city"]);
    expect(lacking.validate()).toBe(false);
    expect(lacking.summaryErrors.value).toEqual([
      "nickname: This field is required",
    ]);
    expect(whole.fieldErrors.size + lacking.fieldErrors.size).toBe(0);
  });

  it("puts a check's error on the field its path names, e.g. a repeated password", () => {
    const $f = createNestedForm(nestedData(), {
      schema: nestedSchema.refine((data) => data.name === data.address?.city, {
        message: "Must be the city",
        path: ["name"],
      }),
    });

    expect($f.validate()).toBe(false);
    expect($f.fields.name.$error).toBe("Must be the city");
  });

  it("isFieldRequired accepts nested paths", () => {
    const $f = createNestedForm();

    expect($f.fields.name.$required).toBe(true);
    expect($f.fields.address.$required).toBe(true);
    expect($f.fields.address.street.$required).toBe(true);
    expect($f.fields.dimensions.$required).toBe(false);
    expect($f.fields.dimensions.length.$required).toBe(false);
    // An array in the schema, even an empty one, is there
    expect($f.fields.tags.$required).toBe(true);
  });
});

describe("useEafForm - handleApiError with nested paths", () => {
  it("maps an error on a nested path onto that field", () => {
    const $f = createNestedForm(
      nestedData(),
      {},
      {
        [EAF_FORM_KEY]: identityParser,
      },
    );

    $f.handleApiError({
      status: 422,
      success: false,
      validationErrors: { "address.street": ["Street does not exist"] },
    });

    expect($f.fields.address.street.$error).toBe("Street does not exist");
    expect($f.fields.address.street.$error).toBe("Street does not exist");
    expect($f.summaryErrors.value).toEqual([]);
  });

  it("maps an error on an array item path (items[0].name, tags[0])", () => {
    const $f = createNestedForm(
      nestedData(),
      {},
      {
        [EAF_FORM_KEY]: identityParser,
      },
    );

    $f.handleApiError({
      status: 422,
      success: false,
      validationErrors: {
        "items[0].name": ["Duplicate name"],
        "tags[0]": ["Too short"],
      },
    });

    expect($f.fields.items[0].name.$error).toBe("Duplicate name");
    expect($f.fields.tags[0].$error).toBe("Too short");
    expect($f.summaryErrors.value).toEqual([]);
  });

  it("puts errors on paths missing from the data into summaryErrors", () => {
    const $f = createNestedForm(
      nestedData({ address: null }),
      {},
      {
        [EAF_FORM_KEY]: identityParser,
      },
    );

    $f.handleApiError({
      status: 422,
      success: false,
      validationErrors: {
        "address.street": ["Street does not exist"],
        "dimensions.depth": ["Depth is required"],
        toString: ["Not a field"],
      },
    });

    expect($f.summaryErrors.value).toEqual([
      "address.street: Street does not exist",
      "dimensions.depth: Depth is required",
      "toString: Not a field",
    ]);
    expect($f.fieldErrors.size).toBe(0);
  });
});

describe("useEafForm - validateOn: change", () => {
  it("checks only the changed field, setting and clearing its error", () => {
    const $f = createNestedForm(nestedData({ name: "" }));

    $f.data.address!.street = "Too long";
    expect($f.fields.address.street.$error).toBe("Street is too long");
    // Untouched fields are left alone until validate()/submit
    expect($f.fields.name.$error).toBeUndefined();

    $f.data.address!.street = "";
    expect($f.fields.address.street.$error).toBe("Street is required");

    $f.data.address!.street = "Oak";
    expect($f.fields.address.street.$error).toBeUndefined();
  });

  it("replaces an API error of the field once its value changes", () => {
    const $f = createNestedForm();
    $f.fields.address.street.$setError("Street does not exist");

    $f.data.address!.street = "Oak";

    expect($f.fields.address.street.$error).toBeUndefined();
  });

  it("checks a nested number field (dimensions.length)", () => {
    const $f = createNestedForm();

    $f.data.dimensions!.length = 0;

    expect($f.fields.dimensions.length.$error).toBe("Length must be positive");
  });

  it("follows a sub-object set to null and back", () => {
    const $f = createNestedForm();
    $f.data.address!.street = "";
    expect($f.fields.address.street.$error).toBeDefined();

    $f.data.address = null;
    expect($f.fields.address.$error).toBe("Address is required");
    expect($f.fields.address.street.$error).toBeUndefined();

    $f.data.address = { street: "Oak", city: "Kraków" };
    expect($f.fields.address.$error).toBeUndefined();
  });

  it("validateOn: submit - checks wait for validate()", () => {
    const $f = createNestedForm(nestedData(), { validateOn: "submit" });

    $f.data.address!.street = "";
    expect($f.fields.address.street.$error).toBeUndefined();

    $f.validate();
    expect($f.fields.address.street.$error).toBe("Street is required");
  });

  it("doesn't validate the data restored by resetForm()", () => {
    const $f = createNestedForm(nestedData({ name: "" }));
    $f.data.name = "Changed";

    $f.resetForm();

    expect($f.data.name).toBe("");
    expect($f.fieldErrors.size).toBe(0);
  });

  it("resetForm(data) puts the given data in, unvalidated and not shared", () => {
    const $f = createNestedForm();
    const loaded = nestedData({
      name: "",
      address: { street: "", city: "Gdańsk" },
    });

    $f.resetForm(loaded);

    expect($f.data.address).toEqual({ street: "", city: "Gdańsk" });
    expect($f.fieldErrors.size).toBe(0);

    $f.data.address!.city = "Changed";
    expect(loaded.address!.city).toBe("Gdańsk");
  });
});

describe("useEafForm - array items", () => {
  const withItems = nestedSchema.extend({
    items: z.array(
      z.object({ name: z.string().min(1, "Item name is required") }),
    ),
    tags: z.array(z.string().max(3, "Tag is too long")),
  });

  it("validate() checks every item, errors keyed like the API's", () => {
    const $f = createNestedForm(
      nestedData({
        items: [{ name: "ok" }, { name: "" }],
        tags: ["abc", "abcd"],
      }),
      { schema: withItems },
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.items[0].name.$error).toBeUndefined();
    expect($f.fields.items[1].name.$error).toBe("Item name is required");
    expect($f.fields.tags[0].$error).toBeUndefined();
    expect($f.fields.tags[1].$error).toBe("Tag is too long");
  });

  it("gives item fields their `required`", () => {
    const $f = createNestedForm(nestedData(), { schema: withItems });

    expect($f.fields.items[5].name.$required).toBe(true);
  });

  it("checks an added item's field when it changes, not before", () => {
    const $f = createNestedForm(nestedData({ items: [] }), {
      schema: withItems,
    });

    $f.data.items.push({ name: "" });
    expect($f.fields.items[0].name.$error).toBeUndefined();

    $f.data.items[0].name = "x";
    $f.data.items[0].name = "";
    expect($f.fields.items[0].name.$error).toBe("Item name is required");
  });

  it("clears the errors of a removed item", () => {
    const $f = createNestedForm(
      nestedData({ items: [{ name: "ok" }, { name: "x" }] }),
      { schema: withItems },
    );
    $f.data.items[1].name = "";
    expect($f.fields.items[1].name.$error).toBe("Item name is required");

    $f.data.items.pop();

    expect($f.fieldErrors.has("items[1].name")).toBe(false);
  });

  it("checks fields of a sub-object that was null when the form was created", () => {
    const $f = createNestedForm(nestedData({ address: null }));

    $f.data.address = { street: "Main", city: "Kraków" };
    $f.data.address.street = "";

    expect($f.fields.address.street.$error).toBe("Street is required");
  });

  it("checks the item count, also when items are added/removed", () => {
    const $f = createNestedForm(nestedData({ items: [{ name: "a" }] }), {
      schema: nestedSchema.extend({
        items: z.array(z.object({ name: z.string() })).min(1, "Add an item"),
      }),
    });

    $f.data.items.pop();
    expect($f.fields.items.$error).toBe("Add an item");

    $f.data.items.push({ name: "b" });
    expect($f.fields.items.$error).toBeUndefined();

    $f.data.items.splice(0, 1);
    expect($f.validate()).toBe(false);
    expect($f.fields.items.$error).toBe("Add an item");
  });
});

describe("useEafForm - resetForm with nested data", () => {
  it("restores nested values on every reset, never sharing objects with the initial snapshot", () => {
    const initial = nestedData();
    const $f = createNestedForm(initial);

    $f.data.address!.street = "Changed";
    $f.data.items[0].name = "changed";
    $f.data.tags.push("b");
    $f.resetForm();

    expect($f.data.address).toEqual({ street: "Main", city: "Kraków" });
    expect($f.data.items).toEqual([{ name: "first" }]);
    expect($f.data.tags).toEqual(["a"]);

    // Second round: the first reset must not have linked data to the snapshot
    $f.data.address!.street = "Changed again";
    $f.data.items[0].name = "changed again";
    $f.resetForm();

    expect($f.data.address).toEqual({ street: "Main", city: "Kraków" });
    expect($f.data.items).toEqual([{ name: "first" }]);
  });

  it("restores a sub-object that was replaced or nulled", () => {
    const $f = createNestedForm();

    $f.data.address = null;
    $f.resetForm();
    expect($f.data.address).toEqual({ street: "Main", city: "Kraków" });

    $f.data.address = { street: "Other", city: "Other" };
    $f.resetForm();
    expect($f.data.address).toEqual({ street: "Main", city: "Kraków" });
  });

  it("leaves defaultValues as they are, even when forms share them", () => {
    const defaults = nestedData();
    const first = createNestedForm(defaults);
    const second = createNestedForm(defaults);

    first.data.address!.city = "Changed";

    expect(second.data.address!.city).toBe("Kraków");
    expect(defaults.address!.city).toBe("Kraków");
  });

  it("works when the config data is a reactive object", () => {
    const $f = createNestedForm(reactive(nestedData()) as NestedForm);

    $f.data.address!.city = "Changed";

    expect(() => $f.resetForm()).not.toThrow();
    expect($f.data.address!.city).toBe("Kraków");
  });

  it("keeps Date and File values (by value / by reference)", () => {
    const createdAt = new Date("2026-01-02T00:00:00Z");
    const file = new File(["x"], "x.txt");
    const { result: $f } = withSetup(() =>
      useEafForm<{ createdAt: Date; file: File | null }>({
        defaultValues: { createdAt, file },
      }),
    );

    $f.data.createdAt.setFullYear(2000);
    $f.data.file = null;
    $f.resetForm();

    expect($f.data.createdAt.getTime()).toBe(
      new Date("2026-01-02T00:00:00Z").getTime(),
    );
    expect($f.data.file).toBe(file);
  });
});

describe("useEafForm - field paths", () => {
  it("isFieldRequired follows the schema, through optional objects too", () => {
    const $f = createNestedForm();

    expect($f.fields.name.$required).toBe(true);
    expect($f.fields.address.$required).toBe(true);
    expect($f.fields.address.street.$required).toBe(true);
    expect($f.fields.tags.$required).toBe(true);
    expect($f.fields.dimensions.width.$required).toBe(false);
    expect($f.fields.items[0].name.$required).toBe(false);
  });

  it("is typed by its schema, which the data must fit", () => {
    const { result: $f } = withSetup(() =>
      useEafForm({
        defaultValues: { qty: null },
        schema: z.object({ qty: z.number().nullable() }),
      }),
    );
    expectTypeOf($f.data.qty).toEqualTypeOf<number | null>();

    withSetup(() =>
      useEafForm({
        // @ts-expect-error - the schema takes a number
        defaultValues: { qty: "1" },
        schema: z.object({ qty: z.number() }),
      }),
    );
  });

  it("rejects unknown fields at the type level", () => {
    const $f = createNestedForm();

    expect($f.fields.items[0].name.$path).toBe("items[0].name");
    // @ts-expect-error - no such field on an array item
    void $f.fields.items[0].nme;
    // @ts-expect-error - strings have no fields
    void $f.fields.name.length;
  });
});

describe("useEafForm - submit", () => {
  it("runs onSubmit once the values are valid, its error going on the fields", async () => {
    const onSubmit = vi.fn();
    const { result: $f } = withSetup(
      () =>
        useEafForm({
          defaultValues: { firstName: "" },
          schema: z.object({ firstName: z.string().min(1) }),
          onSubmit,
        }),
      { [EAF_FORM_KEY]: identityParser },
    );

    await $f.submit();
    expect(onSubmit).not.toHaveBeenCalled();

    $f.data.firstName = "Anna";
    onSubmit.mockRejectedValue({
      status: 422,
      success: false,
      validationErrors: { firstName: ["Already taken"] },
    });
    await $f.submit();

    expect(onSubmit).toHaveBeenCalledWith({ firstName: "Anna" });
    expect($f.fields.firstName.$error).toBe("Already taken");
    expect($f.loading.value).toBe(false);
  });
});

describe("useEafForm - validateOn: blur (the default)", () => {
  const blurForm = (data = nestedData()) =>
    createNestedForm(data, { validateOn: "blur" });

  it("checks a field once it is left, and from then on as it changes", () => {
    const $f = blurForm();

    $f.data.address!.street = "";
    expect($f.fields.address.street.$error).toBeUndefined();

    $f.fields.address.street.$touch();
    expect($f.fields.address.street.$error).toBe("Street is required");

    $f.data.address!.street = "Oak";
    expect($f.fields.address.street.$error).toBeUndefined();
    $f.data.address!.street = "Too long";
    expect($f.fields.address.street.$error).toBe("Street is too long");
  });

  it("checks every changed field once validate() ran", () => {
    const $f = blurForm(nestedData({ name: "" }));

    $f.validate();
    $f.data.name = "Unit";
    $f.data.address!.street = "Too long";

    expect($f.fields.name.$error).toBeUndefined();
    expect($f.fields.address.street.$error).toBe("Street is too long");
  });

  it("keeps an API error of a field only left, until it changes", () => {
    const $f = blurForm();
    $f.fields.name.$setError("Name is taken");

    $f.fields.name.$touch();
    expect($f.fields.name.$error).toBe("Name is taken");

    $f.data.name = "Other";
    expect($f.fields.name.$error).toBeUndefined();
  });

  it("doesn't check fields left while submitting, e.g. inputs it disables", async () => {
    let $f!: EafForm<{ name: string }>;
    withSetup(
      () =>
        ($f = useEafForm({
          defaultValues: { name: "Anna" },
          schema: z.object({ name: z.string() }),
          onSubmit() {
            $f.resetForm({ name: "" });
            $f.fields.name.$touch();
          },
        })),
    );

    await $f.submit();

    expect($f.fields.name.$error).toBeUndefined();
  });

  it("forgets the fields left and validate() on resetForm()", () => {
    const $f = blurForm();
    $f.fields.address.street.$touch();
    $f.validate();

    $f.resetForm();
    $f.data.address!.street = "";

    expect($f.fields.address.street.$error).toBeUndefined();
  });
});

describe("deriveDefaults", () => {
  it("maps every schema type to its empty form value", () => {
    const schema = z.object({
      name: z.string(),
      count: z.number(),
      ratio: z.number().nullable(),
      active: z.boolean(),
      tags: z.array(z.string()),
      address: z.object({ city: z.string(), zip: z.string().nullable() }),
      meta: z.object({ note: z.string() }).nullish(),
      contact: z.union([
        z.null(),
        z.object({ code: z.string(), number: z.string() }),
      ]),
      // How orval writes an optional nullable object
      phone: z.union([z.null(), z.object({ code: z.string() })]).optional(),
      signedOn: z.date().optional(),
    });

    expect(deriveDefaults(schema)).toEqual({
      name: "",
      count: null,
      ratio: null,
      active: false,
      tags: [],
      address: { city: "", zip: null },
      meta: { note: "" },
      contact: { code: "", number: "" },
      phone: { code: "" },
      signedOn: null,
    });
  });

  it("marks a field of an optional nullable object required by its own schema", () => {
    interface Form {
      phone?: { code: string; note: string } | null;
    }
    const { result: $f } = withSetup(() =>
      useEafForm<Form>({
        schema: z.object({
          phone: z
            .union([
              z.null(),
              z.object({ code: z.string().min(1), note: z.string() }),
            ])
            .optional(),
        }),
      }),
    );

    expect($f.fields.phone.code.$required).toBe(true);
    expect($f.fields.phone.note.$required).toBe(false);
  });

  it("keeps the value a schema declares with default() or prefault()", () => {
    const schema = z.object({
      role: z.string().default("user"),
      page: z.number().prefault(1),
      note: z.string().nullable().default("n/a"),
    });

    expect(deriveDefaults(schema)).toEqual({
      role: "user",
      page: 1,
      note: "n/a",
    });
  });

  it("goes through .required(), .readonly() and .catch() to the schema they wrap", () => {
    const schema = z
      .object({
        name: z.string(),
        ids: z.array(z.string()),
        note: z.string().readonly(),
        count: z.number().catch(0),
      })
      .required();

    expect(deriveDefaults(schema)).toEqual({
      name: "",
      ids: [],
      note: "",
      count: null,
    });
  });
});

describe("useEafForm - default values from the schema", () => {
  it("fills the form from the schema when no defaultValues are given", () => {
    interface Form {
      name: string;
      count: number;
    }
    const { result: $f } = withSetup(() =>
      useEafForm<Form>({
        schema: z.object({ name: z.string(), count: z.number() }),
      }),
    );

    expect($f.data).toEqual({ name: "", count: null });
  });

  it("lets defaultValues override the schema's own values", () => {
    interface Form {
      name: string;
      count: number;
    }
    const { result: $f } = withSetup(() =>
      useEafForm<Form>({
        defaultValues: { name: "Jan" },
        schema: z.object({ name: z.string(), count: z.number() }),
      }),
    );

    expect($f.data).toEqual({ name: "Jan", count: null });
  });

  it("resets to the values derived from the schema", () => {
    interface Form {
      name: string;
    }
    const { result: $f } = withSetup(() =>
      useEafForm<Form>({ schema: z.object({ name: z.string() }) }),
    );

    $f.data.name = "changed";
    $f.resetForm();

    expect($f.data.name).toBe("");
  });
});
