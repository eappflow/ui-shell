import { describe, it, expect } from "vitest";
import { isReactive, reactive } from "vue";
import { cloneDeep } from "../cloneDeep";

describe("cloneDeep", () => {
  it("copies nested plain objects and arrays", () => {
    const source = {
      name: "Jakub",
      address: { street: "Main", tags: ["a", "b"] },
      items: [{ name: "first" }],
    };

    const copy = cloneDeep(source);

    expect(copy).toEqual(source);
    expect(copy.address).not.toBe(source.address);
    expect(copy.address.tags).not.toBe(source.address.tags);
    expect(copy.items[0]).not.toBe(source.items[0]);
  });

  it("copies Dates", () => {
    const source = { at: new Date("2026-01-02T03:04:05Z") };

    const copy = cloneDeep(source);

    expect(copy.at).not.toBe(source.at);
    expect(copy.at.getTime()).toBe(source.at.getTime());
  });

  it("keeps Files, Blobs and class instances by reference", () => {
    class Money {
      constructor(public amount: number) {}
    }
    const file = new File(["x"], "x.txt");
    const blob = new Blob(["y"]);
    const money = new Money(5);

    const copy = cloneDeep({ file, blob, money });

    expect(copy.file).toBe(file);
    expect(copy.blob).toBe(blob);
    expect(copy.money).toBe(money);
  });

  it("clones Vue reactive proxies into plain, non-reactive data", () => {
    const state = reactive({ address: { street: "Main" }, list: [1, 2] });

    // structuredClone would throw DataCloneError here
    const copy = cloneDeep(state);

    expect(isReactive(copy)).toBe(false);
    expect(isReactive(copy.address)).toBe(false);
    expect(copy).toEqual({ address: { street: "Main" }, list: [1, 2] });

    state.address.street = "Changed";
    expect(copy.address.street).toBe("Main");
  });

  it("clones reactive proxies nested inside plain objects", () => {
    const inner = reactive({ street: "Main" });

    const copy = cloneDeep({ address: inner });

    expect(isReactive(copy.address)).toBe(false);
    expect(copy.address).toEqual({ street: "Main" });
  });

  it("returns primitives and null as-is", () => {
    expect(cloneDeep(1)).toBe(1);
    expect(cloneDeep("x")).toBe("x");
    expect(cloneDeep(null)).toBeNull();
    expect(cloneDeep(undefined)).toBeUndefined();
  });
});
