import { describe, it, expect } from "vitest";
import { colors, spacing, typography } from "../src/index";

describe("@eappflow/ui-shell-styles", () => {
  it("should export colors", () => {
    expect(colors.primary).toBeDefined();
    expect(colors.primary[500]).toBe("#3b82f6");
  });

  it("should export spacing", () => {
    expect(spacing.md).toBe("1rem");
  });

  it("should export typography", () => {
    expect(typography.fontFamily.sans).toContain("Inter");
  });
});