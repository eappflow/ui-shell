import { describe, expect, it } from "vitest";
import { daysAgo } from "../daysAgo";

describe("daysAgo", () => {
  it("counts calendar days, not 24-hour spans", () => {
    const now = new Date(2026, 9, 11, 0, 30);

    expect(daysAgo(new Date(2026, 9, 11, 0, 5).toISOString(), now)).toBe(0);
    expect(daysAgo(new Date(2026, 9, 10, 23, 55).toISOString(), now)).toBe(1);
    expect(daysAgo(new Date(2026, 9, 4, 12, 0).toISOString(), now)).toBe(7);
    expect(daysAgo(new Date(2026, 8, 11, 12, 0).toISOString(), now)).toBe(30);
  });
});
