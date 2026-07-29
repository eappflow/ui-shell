import { describe, it, expect } from "vitest";
import { getFieldViolations } from "../fieldValidators";
import type { FieldRule } from "../fieldValidators";

describe("getFieldViolations", () => {
  it("flags an empty value against a required rule", () => {
    const rules: FieldRule = {
      required: { required: true, message: "Required" },
    };
    expect(getFieldViolations("", rules)).toEqual(["Required"]);
  });

  it("passes a required rule when a value is present", () => {
    const rules: FieldRule = {
      required: { required: true, message: "Required" },
    };
    expect(getFieldViolations("Jakub", rules)).toEqual([]);
  });

  it("flags a string shorter than minLength", () => {
    const rules: FieldRule = {
      length: { minLength: 2, maxLength: 10, message: "Length" },
    };
    expect(getFieldViolations("J", rules)).toEqual(["Length"]);
  });

  it("flags a string longer than maxLength", () => {
    const rules: FieldRule = {
      length: { minLength: 2, maxLength: 10, message: "Length" },
    };
    expect(getFieldViolations("ThisNameIsWayTooLong", rules)).toEqual([
      "Length",
    ]);
  });

  it("flags a number below the range min", () => {
    const rules: FieldRule = { range: { min: 18, max: 65, message: "Range" } };
    expect(getFieldViolations(10, rules)).toEqual(["Range"]);
  });

  it("flags a number above the range max", () => {
    const rules: FieldRule = { range: { min: 18, max: 65, message: "Range" } };
    expect(getFieldViolations(99, rules)).toEqual(["Range"]);
  });

  it("flags a string that doesn't match the pattern", () => {
    const rules: FieldRule = {
      pattern: {
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Pattern",
      },
    };
    expect(getFieldViolations("not-an-email", rules)).toEqual(["Pattern"]);
  });

  it("ignores rules that don't apply to the value's type", () => {
    const rules: FieldRule = {
      length: { minLength: 2, maxLength: 10, message: "Length" },
      range: { min: 18, max: 65, message: "Range" },
    };
    expect(getFieldViolations(30, rules)).toEqual([]);
  });

  it("collects violations from multiple rule types on the same value", () => {
    const rules: FieldRule = {
      required: { required: true, message: "Required" },
      length: { minLength: 5, maxLength: 10, message: "Length" },
    };
    expect(getFieldViolations("", rules)).toEqual(["Required", "Length"]);
  });
});
