import { describe, expect, it } from "vitest";
import { filterPermitted } from "../permissions";

describe("filterPermitted", () => {
  it("keeps what has no permissions or one the user has", () => {
    const items = [
      { name: "open" },
      { name: "orders", permissions: ["Orders", "Admin"] },
      { name: "admin", permissions: ["Admin"] },
    ];

    expect(filterPermitted(items, ["Orders"]).map((i) => i.name)).toEqual([
      "open",
      "orders",
    ]);
  });
});
