import { describe, it, expect } from "vitest";
import { DEFAULT_NAVIGATION_ITEMS, STORAGE_KEYS, SHELL_VERSION } from "../src/utils/constants";

describe("@eappflow/ui-shell", () => {
  it("should export version", () => {
    expect(SHELL_VERSION).toBe("0.1.0");
  });

  it("should export storage keys", () => {
    expect(STORAGE_KEYS.AUTH_TOKEN).toBe("eappflow_auth_token");
  });

  it("should export default navigation items", () => {
    expect(DEFAULT_NAVIGATION_ITEMS).toHaveLength(2);
  });
});