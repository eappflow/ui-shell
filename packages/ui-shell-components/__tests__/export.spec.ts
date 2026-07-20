import { describe, it, expect } from "vitest";
import * as exports from "../src";

describe("exports", () => {
  const expectedExports = [
    "EafFormItem",
    "EafFormValidationSummary",
    "EafActionValidationMessage",
    "useEafMessageStore",
    "useEafFormValidation",
    "default",
  ] as const;

  it.each(expectedExports)("exports %s", (name) => {
    expect(exports[name]).toBeDefined();
  });

  it("has no unexpected exports", () => {
    expect(Object.keys(exports).sort()).toEqual([...expectedExports].sort());
  });

  it("default export is an installable plugin", () => {
    expect(exports.default).toBeTypeOf("object");
    expect(exports.default.install).toBeTypeOf("function");
  });
});
