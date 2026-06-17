import { describe, it, expect } from "vitest";
import { useEafFormValidation, required, minLength } from "../src/composables/useEafFormValidation";

describe("useEafFormValidation", () => {
  it("should validate required fields", () => {
    const rule = required();
    expect(rule("")).toBe("This field is required");
    expect(rule(null)).toBe("This field is required");
    expect(rule("hello")).toBe(true);
  });

  it("should validate min length", () => {
    const rule = minLength(3);
    expect(rule("ab")).toBe("Must be at least 3 characters");
    expect(rule("abc")).toBe(true);
  });

  it("should track form errors", () => {
    const { errors, validateField, hasErrors, clearErrors } = useEafFormValidation();

    validateField("name", "", [required()]);
    expect(hasErrors()).toBe(true);
    expect(errors.value.name).toBe("This field is required");

    validateField("name", "John", [required()]);
    expect(hasErrors()).toBe(false);

    clearErrors();
    expect(errors.value).toEqual({});
  });
});