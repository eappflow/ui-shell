import { describe, it, expect, vi, afterEach } from "vitest";
import { computed, isReactive, isRef, reactive } from "vue";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { useEafForm, EAF_FORM_KEY } from "../useEafForm";
import type {
  ApiParsedErrorResponse,
  EafForm,
  EafFormApiErrorParser,
  EafRules,
  RulesForFormData,
} from "../../types";

interface TestForm {
  firstName: string;
  age: number;
  email: string;
}

const rules: RulesForFormData<TestForm> = {
  firstName: {
    required: { message: "First name is required" },
    length: {
      minLength: 2,
      maxLength: 10,
      message: "First name must be 2-10 characters",
    },
  },
  age: {
    range: { min: 18, max: 65, message: "Age must be between 18 and 65" },
  },
  email: {
    pattern: {
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
    expect($f.getFieldError("firstName")).toBe("First name is required");
  });

  it("passes validation when every field satisfies its rules", () => {
    const $f = createForm(validData);

    expect($f.validate()).toBe(true);
    expect($f.hasFieldError("firstName")).toBe(false);
    expect($f.hasFieldError("age")).toBe(false);
    expect($f.hasFieldError("email")).toBe(false);
  });

  it("collects violations from multiple fields at once", () => {
    const $f = createForm({ firstName: "", age: 5, email: "bad" });

    expect($f.validate()).toBe(false);
    expect($f.hasFieldError("firstName")).toBe(true);
    expect($f.hasFieldError("age")).toBe(true);
    expect($f.hasFieldError("email")).toBe(true);
  });
});

describe("useEafForm - required: true fallback message", () => {
  it("falls back to a hardcoded message when no vue-i18n plugin is installed", () => {
    const { result: $f } = withSetup(() =>
      useEafForm<Pick<TestForm, "firstName">>({
        data: reactive({ firstName: "" }),
        rules: { firstName: { required: true } },
      }),
    );

    expect($f.validate()).toBe(false);
    expect($f.getFieldError("firstName")).toBe("This field is required");
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
            rules: { firstName: { required: true } },
          });
          return () => null;
        },
      },
      { global: { plugins: [i18n] } },
    );

    expect($f.validate()).toBe(false);
    expect($f.getFieldError("firstName")).toBe("To pole jest wymagane");
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
    $f.setFieldError("firstName", "Some client-side error");

    $f.resetForm();

    expect($f.hasFieldError("firstName")).toBe(false);
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
    expect($f.getFieldError("firstName")).toBe("First name is already taken");
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
    expect($f.hasFieldError("someServerOnlyField")).toBe(false);
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
    $f.setFieldError("firstName", "pre-existing error");

    const handled = $f.handleApiError({
      status: 500,
      success: false,
      handleErrors: false,
    });

    expect(handled).toBe(false);
    // Existing state must be left untouched when the error isn't handled
    expect($f.getFieldError("firstName")).toBe("pre-existing error");
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
  name: { required: true },
  address: {
    required: { message: "Address is required" },
    street: {
      required: { message: "Street is required" },
      length: { maxLength: 5, message: "Street is too long" },
    },
    city: { required: true },
  },
  dimensions: {
    // `length` is a data field here, not the string length rule
    length: { range: { min: 1, message: "Length must be positive" } },
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
  options: { rules?: EafRules<NestedForm>; showAllErrors?: boolean } = {},
  provideMap: Record<string | symbol, unknown> = {},
) {
  const { result } = withSetup(
    () =>
      useEafForm<NestedForm>({
        data,
        rules: options.rules ?? nestedRules,
        showAllErrors: options.showAllErrors,
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
    expect($f.getFieldError("address.street")).toBe("Street is required");
    expect($f.getFieldError("address.city")).toBe("This field is required");
    expect($f.hasFieldError("address")).toBe(false);
  });

  it("applies non-required rules (length) to nested fields", () => {
    const $f = createNestedForm(
      nestedData({ address: { street: "Too long street", city: "X" } }),
    );

    expect($f.validate()).toBe(false);
    expect($f.getAllFieldErrors("address.street")).toEqual([
      "Street is too long",
    ]);
  });

  it("treats a nested data field named like a rule (`length`) as a field", () => {
    const $f = createNestedForm(
      nestedData({ dimensions: { length: 0, width: 3 } }),
    );

    expect($f.validate()).toBe(false);
    expect($f.getFieldError("dimensions.length")).toBe(
      "Length must be positive",
    );
  });

  it("resolves required: true on nested fields to the translated message", () => {
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
    expect($f.getFieldError("address.city")).toBe("To pole jest wymagane");
  });

  describe("missing (null/undefined) sub-object", () => {
    it("with `required`: reports the error on the object path and skips its children", () => {
      const $f = createNestedForm(nestedData({ address: null }));

      expect($f.validate()).toBe(false);
      expect($f.getFieldError("address")).toBe("Address is required");
      expect($f.hasFieldError("address.street")).toBe(false);
      expect($f.hasFieldError("address.city")).toBe(false);
      expect($f.fields.address.$error).toBe("Address is required");
    });

    it("without `required`: skips the whole sub-object", () => {
      const $f = createNestedForm(nestedData({ dimensions: undefined }), {
        rules: {
          dimensions: {
            length: { range: { min: 1, message: "Length must be positive" } },
          },
        },
      });

      expect($f.validate()).toBe(true);
      expect($f.fieldErrors.size).toBe(0);
    });

    it("without `required` on a null object: children with `required` are skipped too", () => {
      const $f = createNestedForm(nestedData({ address: null }), {
        rules: { address: { street: { required: true } } },
      });

      expect($f.validate()).toBe(true);
    });
  });

  it("validates arrays as single values (leaves)", () => {
    const $f = createNestedForm(nestedData({ tags: [] }), {
      rules: { tags: { required: true } },
    });

    // An empty array is not an "empty value" - arrays are only leaves
    expect($f.validate()).toBe(true);
  });

  it("isFieldRequired accepts nested paths", () => {
    const $f = createNestedForm();

    expect($f.isFieldRequired("name")).toBe(true);
    expect($f.isFieldRequired("address")).toBe(true);
    expect($f.isFieldRequired("address.street")).toBe(true);
    expect($f.isFieldRequired("dimensions")).toBe(false);
    expect($f.isFieldRequired("dimensions.length")).toBe(false);
    expect($f.isFieldRequired("tags")).toBe(false);
  });

  it("keeps a top-level field literally named `required` working", () => {
    const { result: $f } = withSetup(() =>
      useEafForm<{ required: string }>({
        data: { required: "" },
        rules: { required: { required: true } },
      }),
    );

    expect($f.validate()).toBe(false);
    expect($f.hasFieldError("required")).toBe(true);
    expect($f.isFieldRequired("required")).toBe(true);
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

    expect($f.getFieldError("address.street")).toBe("Street does not exist");
    expect($f.fields.address.street.$error).toBe("Street does not exist");
    expect($f.summaryErrors.value).toEqual([]);
  });

  it("maps an error on an array item path (items.0.name)", () => {
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
      validationErrors: { "items.0.name": ["Duplicate name"] },
    });

    expect($f.getFieldError("items.0.name")).toBe("Duplicate name");
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

describe("useEafForm - mapErrorPath (request shape differs from the form data)", () => {
  // The form holds `{ name, address, ... }`, the request wraps those fields
  // as `{ baseInfo: { name, address }, tags }`
  const unwrapBaseInfo = (path: string) => path.replace(/^baseInfo\./, "");

  function createForm() {
    return createNestedForm(
      nestedData(),
      {},
      {
        [EAF_FORM_KEY]: identityParser,
      },
    );
  }

  it("handleApiError maps a key onto the nested field it belongs to", () => {
    const $f = createForm();

    const handled = $f.handleApiError(
      {
        status: 422,
        success: false,
        validationErrors: {
          "baseInfo.address.street": ["Street does not exist"],
          "baseInfo.name": ["Name is taken"],
          tags: ["Too many tags"],
        },
      },
      { mapErrorPath: unwrapBaseInfo },
    );

    expect(handled).toBe(true);
    expect($f.fields.address.street.$error).toBe("Street does not exist");
    expect($f.fields.name.$error).toBe("Name is taken");
    // Keys the mapper leaves as they are still match directly
    expect($f.fields.tags.$error).toBe("Too many tags");
    expect($f.summaryErrors.value).toEqual([]);
  });

  it("puts keys that match no field after mapping into the summary, under the mapped path", () => {
    const $f = createForm();

    $f.handleApiError(
      {
        status: 422,
        success: false,
        validationErrors: {
          "baseInfo.address.zip": ["Zip is invalid"],
          "data.color": ["Unknown color"],
        },
      },
      { mapErrorPath: unwrapBaseInfo },
    );

    expect($f.summaryErrors.value).toEqual([
      "address.zip: Zip is invalid",
      "data.color: Unknown color",
    ]);
    expect($f.fieldErrors.size).toBe(0);
  });

  it("keeps the messages of every key mapped onto the same field", () => {
    const $f = createForm();

    $f.handleApiError(
      {
        status: 422,
        success: false,
        validationErrors: {
          name: ["Name is required"],
          "baseInfo.name": ["Name is taken"],
        },
      },
      { mapErrorPath: unwrapBaseInfo },
    );

    expect($f.fields.name.$errors).toEqual([
      "Name is required",
      "Name is taken",
    ]);
  });

  it("without the option leaves the keys unmapped (they land in the summary)", () => {
    const $f = createForm();

    $f.handleApiError({
      status: 422,
      success: false,
      validationErrors: { "baseInfo.name": ["Name is taken"] },
    });

    expect($f.summaryErrors.value).toEqual(["baseInfo.name: Name is taken"]);
    expect($f.hasFieldError("name")).toBe(false);
  });

  it("submit passes the options on to handleApiError", async () => {
    const $f = createForm();
    const mapErrorPath = vi.fn(unwrapBaseInfo);

    await $f.submit(
      async () => {
        throw {
          status: 422,
          success: false,
          validationErrors: { "baseInfo.address.city": ["Unknown city"] },
        } satisfies ApiParsedErrorResponse;
      },
      { mapErrorPath },
    );

    expect(mapErrorPath).toHaveBeenCalledWith("baseInfo.address.city");
    expect($f.fields.address.city.$error).toBe("Unknown city");
    expect($f.summaryErrors.value).toEqual([]);
    expect($f.loading.value).toBe(false);
  });

  it("submit without options keeps the plain behaviour", async () => {
    const $f = createForm();

    await $f.submit(async () => {
      throw {
        status: 422,
        success: false,
        validationErrors: { "baseInfo.address.city": ["Unknown city"] },
      } satisfies ApiParsedErrorResponse;
    });

    expect($f.summaryErrors.value).toEqual([
      "baseInfo.address.city: Unknown city",
    ]);
    expect($f.hasFieldError("address.city")).toBe(false);
  });
});

describe("useEafForm - showInSummary (data no field displays)", () => {
  function createForm() {
    return createNestedForm(
      nestedData(),
      {},
      {
        [EAF_FORM_KEY]: identityParser,
      },
    );
  }

  it("sends errors on selected existing paths to the summary, the rest to their fields", () => {
    const $f = createForm();

    $f.handleApiError(
      {
        status: 422,
        success: false,
        validationErrors: {
          "items.0.name": ["Name is invalid"],
          "address.street": ["Street does not exist"],
          name: ["Name is taken"],
        },
      },
      { showInSummary: (path) => path.startsWith("items.") },
    );

    expect($f.summaryErrors.value).toEqual(["items.0.name: Name is invalid"]);
    expect($f.hasFieldError("items.0.name")).toBe(false);
    expect($f.fields.address.street.$error).toBe("Street does not exist");
    expect($f.fields.name.$error).toBe("Name is taken");
  });

  it("is applied to the mapped path", () => {
    const $f = createForm();
    const showInSummary = vi.fn((path: string) => path.startsWith("address."));

    $f.handleApiError(
      {
        status: 422,
        success: false,
        validationErrors: {
          "baseInfo.address.city": ["Unknown city"],
          "baseInfo.name": ["Name is taken"],
        },
      },
      {
        mapErrorPath: (path) => path.replace(/^baseInfo\./, ""),
        showInSummary,
      },
    );

    expect(showInSummary).toHaveBeenCalledWith("address.city");
    expect(showInSummary).not.toHaveBeenCalledWith("baseInfo.address.city");
    expect($f.summaryErrors.value).toEqual(["address.city: Unknown city"]);
    expect($f.fields.name.$error).toBe("Name is taken");
  });

  it("submit passes it on to handleApiError", async () => {
    const $f = createForm();

    await $f.submit(
      async () => {
        throw {
          status: 422,
          success: false,
          validationErrors: { tags: ["Too many tags"] },
        } satisfies ApiParsedErrorResponse;
      },
      { showInSummary: (path) => path === "tags" },
    );

    expect($f.summaryErrors.value).toEqual(["tags: Too many tags"]);
    expect($f.fieldErrors.size).toBe(0);
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

describe("useEafForm - field handles ($f.fields)", () => {
  it("exposes the dot path of every field, including through null sub-objects", () => {
    const $f = createNestedForm(nestedData({ address: null }));

    expect($f.fields.name.$path).toBe("name");
    expect($f.fields.address.$path).toBe("address");
    expect($f.fields.address.street.$path).toBe("address.street");
    expect($f.fields.dimensions.length.$path).toBe("dimensions.length");
  });

  it("exposes $required from the rules tree", () => {
    const $f = createNestedForm();

    expect($f.fields.name.$required).toBe(true);
    expect($f.fields.address.$required).toBe(true);
    expect($f.fields.address.street.$required).toBe(true);
    expect($f.fields.tags.$required).toBe(false);
    expect($f.fields.dimensions.width.$required).toBe(false);
  });

  it("returns the same handle object for the same path (stable identity)", () => {
    const $f = createNestedForm();

    expect($f.fields.address).toBe($f.fields.address);
    expect($f.fields.address.street).toBe($f.fields.address.street);
    expect($f.fields.name).not.toBe($f.fields.address);
  });

  it("exposes $errors/$error that are reactive inside computed", () => {
    const $f = createNestedForm();
    const street = computed(() => $f.fields.address.street.$error);
    const allStreet = computed(() => $f.fields.address.street.$errors);

    expect(street.value).toBeUndefined();
    expect(allStreet.value).toEqual([]);

    $f.setFieldError("address.street", ["First", "Second"]);
    expect(street.value).toBe("First");
    expect(allStreet.value).toEqual(["First", "Second"]);

    $f.clearErrors();
    expect(street.value).toBeUndefined();
    expect(allStreet.value).toEqual([]);
  });

  it("keeps $error the first message even with showAllErrors", () => {
    const $f = createNestedForm(nestedData(), { showAllErrors: true });

    $f.setFieldError("name", ["First", "Second"]);

    expect($f.fields.name.$error).toBe("First");
    expect($f.fields.name.$errors).toEqual(["First", "Second"]);
  });

  it("is not mistaken for a ref, reactive proxy or thenable", async () => {
    const $f = createNestedForm();
    const handle = $f.fields.address as unknown as Record<string, unknown>;

    expect(handle.__v_isRef).toBeUndefined();
    expect(handle.__v_isReactive).toBeUndefined();
    expect(handle.__v_raw).toBeUndefined();
    expect(handle.then).toBeUndefined();
    expect(handle.toJSON).toBeUndefined();
    expect(isRef(handle)).toBe(false);
    expect(isReactive(handle)).toBe(false);
    expect(await Promise.resolve(handle)).toBe(handle);
  });

  it("is markRaw, so reactive() never wraps it", () => {
    const $f = createNestedForm();
    const state = reactive({ field: $f.fields.address.street });

    expect(state.field).toBe($f.fields.address.street);
    expect(isReactive(state.field)).toBe(false);
  });

  it("returns undefined for symbol keys and keeps Object.prototype members", () => {
    const $f = createNestedForm();
    const handle = $f.fields.name as unknown as Record<PropertyKey, unknown>;

    expect(handle[Symbol("anything")]).toBeUndefined();
    expect(handle.constructor).toBe(Object);
    expect(() => String(handle)).not.toThrow();
  });

  it("serializes its metadata with JSON.stringify", () => {
    const $f = createNestedForm();
    $f.setFieldError("address.city", "City is required");

    expect(JSON.parse(JSON.stringify($f.fields.address.city))).toEqual({
      $path: "address.city",
      $required: true,
      $errors: ["City is required"],
      $error: "City is required",
    });
  });

  it("rejects unknown fields and rules at the type level", () => {
    const $f = createNestedForm();

    // @ts-expect-error - no such field
    void $f.fields.address.stret;
    // @ts-expect-error - arrays are leaves, no per-item handles
    void $f.fields.tags.length.$path;

    const rules: EafRules<NestedForm> = {
      address: {
        // @ts-expect-error - no such field
        stret: { required: true },
      },
      // @ts-expect-error - `length` rule is only for strings
      dimensions: { width: { length: { maxLength: 1, message: "x" } } },
    };
    void rules;

    // Legacy name is an alias of the new type
    const legacyRules: RulesForFormData<NestedForm> = nestedRules;
    void legacyRules;
  });
});
