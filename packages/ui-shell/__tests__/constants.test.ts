import { describe, it, expect } from "vitest";
import { STORAGE_KEYS } from "../src";

describe("@eappflow/ui-shell", () => {
  it("should export storage keys", () => {
    expect(STORAGE_KEYS).toBeDefined();
    expect(STORAGE_KEYS.AUTH_TOKEN).toBe("access_token");
  });
});
