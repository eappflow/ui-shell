import { describe, it, expect, vi, afterEach } from "vitest";
import { reactive } from "vue";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { useEafForm, EAF_FORM_KEY } from "../useEafForm";
import type {
  ApiParsedErrorResponse,
  EafForm,
  EafFormApiErrorParser,
  EafFormConfig,
  EafRules,
} from "../../types";

interface TestForm {
  firstName: string;
  age: number;
  email: string;
}

const rules: EafRules<TestForm> = {
  firstName: {
    $required: { message: "First name is required" },
    $length: {
      minLength: 2,
      maxLength: 10,
      message: "First name must be 2-10 characters",
    },
  },
  age: {
    $range: { min: 18, max: 65, message: "Age must be between 18 and 65" },
  },
  email: {
    $pattern: {
      regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Enter a valid email address",
    },
  },
};

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
    useEafForm<TestForm>({
      data: reactive({ firstName: "", age: 0, email: "", ...data }),
      rules,
    }),
  );
  return result;
}

const validData: TestForm = { firstName: "Jakub", age: 30, email: "a@b.com" };

describe("useEafForm - rules validation", () => {
  it("fails validation and surfaces the configured rule message for an invalid field", () => {
    const $f = createForm({ ...validData, firstName: "" });

    expect($f.validate()).toBe(false);
    expect($f.fields.firstName.$error).toBe("First name is required");
  });

  it("passes validation when every field satisfies its rules", () => {
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

describe("useEafForm - $required: true fallback message", () => {
  it("falls back to a hardcoded message when no vue-i18n plugin is installed", () => {
    const { result: $f } = withSetup(() =>
      useEafForm<Pick<TestForm, "firstName">>({
        data: reactive({ firstName: "" }),
        rules: { firstName: { $required: true } },
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

    let $f!: ReturnType<typeof useEafForm<Pick<TestForm, "firstName">>>;
    mount(
      {
        setup() {
          $f = useEafForm<Pick<TestForm, "firstName">>({
            data: reactive({ firstName: "" }),
            rules: { firstName: { $required: true } },
          });
          return () => null;
        },
      },
      { global: { plugins: [i18n] } },
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.firstName.$error).toBe("To pole jest wymagane");
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
      () => useEafForm<TestForm>({ data: reactive({ ...validData }) }),
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
});

describe("useEafForm - handleApiError with an injected parser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createFormWithParser(parser: EafFormApiErrorParser) {
    const { result } = withSetup(
      () =>
        useEafForm<TestForm>({
          data: reactive({ firstName: "", age: 0, email: "" }),
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
        data: reactive({ firstName: "", age: 0, email: "" }),
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

interface Address {
  street: string;
  city: string;
}

interface NestedForm {
  name: string;
  address: Address | null;
  dimensions?: { length: number; width: number };
  tags: string[];
  items: { name: string }[];
}

const nestedRules: EafRules<NestedForm> = {
  name: { $required: true },
  address: {
    $required: { message: "Address is required" },
    street: {
      $required: { message: "Street is required" },
      $length: { maxLength: 5, message: "Street is too long" },
    },
    city: { $required: true },
  },
  dimensions: {
    // `length` is a data field here, not the string length rule
    length: { $range: { min: 1, message: "Length must be positive" } },
  },
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
  options: Omit<EafFormConfig<NestedForm>, "data"> = {},
  provideMap: Record<string | symbol, unknown> = {},
) {
  const { result } = withSetup(
    () =>
      useEafForm<NestedForm>({
        ...options,
        data,
        rules: options.rules ?? nestedRules,
      }),
    provideMap,
  );
  return result;
}

const identityParser: EafFormApiErrorParser = (error) =>
  error as ApiParsedErrorResponse;

describe("useEafForm - nested rules validation", () => {
  it("passes when every nested field satisfies its rules", () => {
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

  it("applies non-required rules (length) to nested fields", () => {
    const $f = createNestedForm(
      nestedData({ address: { street: "Too long street", city: "X" } }),
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.address.street.$errors).toEqual(["Street is too long"]);
  });

  it("treats a nested data field named like a rule (`length`) as a field", () => {
    const $f = createNestedForm(
      nestedData({ dimensions: { length: 0, width: 3 } }),
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.dimensions.length.$error).toBe("Length must be positive");
  });

  it("resolves $required: true on nested fields to the translated message", () => {
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
            data: nestedData({ address: { street: "Main", city: "" } }),
            rules: nestedRules,
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
    it("with `required`: reports the error on the object path and skips its children", () => {
      const $f = createNestedForm(nestedData({ address: null }));

      expect($f.validate()).toBe(false);
      expect($f.fields.address.$error).toBe("Address is required");
      expect($f.fields.address.street.$error).toBeUndefined();
      expect($f.fields.address.city.$error).toBeUndefined();
      expect($f.fields.address.$error).toBe("Address is required");
    });

    it("without `required`: skips the whole sub-object", () => {
      const $f = createNestedForm(nestedData({ dimensions: undefined }), {
        rules: {
          dimensions: {
            length: { $range: { min: 1, message: "Length must be positive" } },
          },
        },
      });

      expect($f.validate()).toBe(true);
      expect($f.fieldErrors.size).toBe(0);
    });

    it("without `required` on a null object: children with `required` are skipped too", () => {
      const $f = createNestedForm(nestedData({ address: null }), {
        rules: { address: { street: { $required: true } } },
      });

      expect($f.validate()).toBe(true);
    });
  });

  it("validates arrays as single values (leaves)", () => {
    const $f = createNestedForm(nestedData({ tags: [] }), {
      rules: { tags: { $required: true } },
    });

    // An empty array is not an "empty value" - arrays are only leaves
    expect($f.validate()).toBe(true);
  });

  it("isFieldRequired accepts nested paths", () => {
    const $f = createNestedForm();

    expect($f.fields.name.$required).toBe(true);
    expect($f.fields.address.$required).toBe(true);
    expect($f.fields.address.street.$required).toBe(true);
    expect($f.fields.dimensions.$required).toBe(false);
    expect($f.fields.dimensions.length.$required).toBe(false);
    expect($f.fields.tags.$required).toBe(false);
  });

  it("checks fields named like rules (`required`), nested ones too", () => {
    const { result: $f } = withSetup(() =>
      useEafForm<{ required: string; opts: { required: string } }>({
        data: { required: "", opts: { required: "" } },
        rules: {
          required: { $required: true },
          opts: { required: { $required: true } },
        },
      }),
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.required.$error).toBeDefined();
    expect($f.fields.opts.required.$error).toBeDefined();
    expect($f.fields.opts.required.$required).toBe(true);
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

describe("useEafForm - rules checked when a value changes", () => {
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

  it("checks a data field named like a rule (dimensions.length)", () => {
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

  it("is off with validateOnChange: false - rules wait for validate()", () => {
    const $f = createNestedForm(nestedData(), { validateOnChange: false });

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

describe("useEafForm - array items ($each)", () => {
  const withItemRules: EafRules<NestedForm> = {
    ...nestedRules,
    items: {
      $each: { name: { $required: { message: "Item name is required" } } },
    },
    tags: { $each: { $length: { maxLength: 3, message: "Tag is too long" } } },
  };

  it("validate() checks every item, errors keyed like the API's", () => {
    const $f = createNestedForm(
      nestedData({
        items: [{ name: "ok" }, { name: "" }],
        tags: ["abc", "abcd"],
      }),
      { rules: withItemRules },
    );

    expect($f.validate()).toBe(false);
    expect($f.fields.items[0].name.$error).toBeUndefined();
    expect($f.fields.items[1].name.$error).toBe("Item name is required");
    expect($f.fields.tags[0].$error).toBeUndefined();
    expect($f.fields.tags[1].$error).toBe("Tag is too long");
  });

  it("gives item fields their `required`", () => {
    const $f = createNestedForm(nestedData(), { rules: withItemRules });

    expect($f.fields.items[5].name.$required).toBe(true);
    expect($f.fields.tags[0].$required).toBe(false);
  });

  it("checks an added item's field when it changes, not before", () => {
    const $f = createNestedForm(nestedData({ items: [] }), {
      rules: withItemRules,
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
      { rules: withItemRules },
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

  it("checks the item count with `$length`, also when items are added/removed", () => {
    const $f = createNestedForm(nestedData({ items: [{ name: "a" }] }), {
      rules: {
        ...nestedRules,
        items: { $length: { minLength: 1, message: "Add an item" } },
      },
    });

    $f.data.items.pop();
    expect($f.fields.items.$error).toBe("Add an item");

    $f.data.items.push({ name: "b" });
    expect($f.fields.items.$error).toBeUndefined();

    $f.data.items.splice(0, 1);
    expect($f.validate()).toBe(false);
    expect($f.fields.items.$error).toBe("Add an item");
  });

  it("types `$each` from the item", () => {
    const rules: EafRules<NestedForm> = {
      // @ts-expect-error - no such field on an item
      items: { $each: { nme: { $required: true } } },
      // @ts-expect-error - `range` rule is only for numbers
      tags: { $each: { $range: { min: 1, message: "x" } } },
    };
    void rules;
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
        data: { createdAt, file },
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
  it("isFieldRequired reads the nested rules tree", () => {
    const $f = createNestedForm();

    expect($f.fields.name.$required).toBe(true);
    expect($f.fields.address.$required).toBe(true);
    expect($f.fields.address.street.$required).toBe(true);
    expect($f.fields.tags.$required).toBe(false);
    expect($f.fields.dimensions.width.$required).toBe(false);
    // Array items have typed paths, but no per-item rules
    expect($f.fields.items[0].name.$required).toBe(false);
  });

  it("rejects unknown fields and rules at the type level", () => {
    const $f = createNestedForm();

    expect($f.fields.items[0].name.$path).toBe("items[0].name");
    // @ts-expect-error - no such field on an array item
    void $f.fields.items[0].nme;
    // @ts-expect-error - strings have no fields
    void $f.fields.name.length;

    const rules: EafRules<NestedForm> = {
      address: {
        // @ts-expect-error - no such field
        stret: { $required: true },
      },
      // @ts-expect-error - `length` rule is only for strings
      dimensions: { width: { $length: { maxLength: 1, message: "x" } } },
    };
    void rules;
  });
});
