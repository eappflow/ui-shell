import { describe, it, expect, vi, afterEach } from "vitest";
import { reactive } from "vue";
import { mount } from "@vue/test-utils";
import { useEafForm, EAF_FORM_KEY } from "../useEafForm";
import type {
  ApiParsedErrorResponse,
  EafFormApiErrorParser,
  RulesForFormData,
} from "../../types";

interface TestForm {
  firstName: string;
  age: number;
  email: string;
}

const rules: RulesForFormData<TestForm> = {
  firstName: {
    required: { required: true, message: "First name is required" },
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
  it.each<[string, Partial<TestForm>, keyof TestForm, string]>([
    ["required", { firstName: "" }, "firstName", "First name is required"],
    [
      "length - below minLength",
      { firstName: "J" },
      "firstName",
      "First name must be 2-10 characters",
    ],
    [
      "length - above maxLength",
      { firstName: "ThisNameIsWayTooLong" },
      "firstName",
      "First name must be 2-10 characters",
    ],
    [
      "range - below min",
      { age: 10 },
      "age",
      "Age must be between 18 and 65",
    ],
    [
      "range - above max",
      { age: 99 },
      "age",
      "Age must be between 18 and 65",
    ],
    [
      "pattern - malformed value",
      { email: "not-an-email" },
      "email",
      "Enter a valid email address",
    ],
  ])("fails the %s rule", (_label, overrides, field, message) => {
    const $f = createForm({ ...validData, ...overrides });

    expect($f.validate()).toBe(false);
    expect($f.getFieldError(field)).toBe(message);
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

  it("ignores errors whose parsed status is not 422", () => {
    const parser: EafFormApiErrorParser = (error) =>
      error as ApiParsedErrorResponse;
    const $f = createFormWithParser(parser);
    $f.setFieldError("firstName", "pre-existing error");

    const handled = $f.handleApiError({ status: 500, success: false });

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
