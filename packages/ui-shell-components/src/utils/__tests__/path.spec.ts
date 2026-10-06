import { describe, it, expect } from "vitest";
import { reactive, isReactive, isRef } from "vue";
import { createFields, getByPath, hasPath, isPlainObject } from "../path";
import type { EafFields } from "../../types";

const data = {
  name: "Jakub",
  empty: null as string | null,
  missing: undefined as string | undefined,
  address: { street: "Main", city: "" },
  items: [{ name: "first" }, { name: "second" }],
};

describe("getByPath", () => {
  it("reads top-level and nested values", () => {
    expect(getByPath(data, "name")).toBe("Jakub");
    expect(getByPath(data, "address.street")).toBe("Main");
    expect(getByPath(data, "address")).toBe(data.address);
  });

  it("follows array indexes", () => {
    expect(getByPath(data, "items[1].name")).toBe("second");
    expect(getByPath(data, "items[0]")).toBe(data.items[0]);
  });

  it("returns undefined for missing paths", () => {
    expect(getByPath(data, "nope")).toBeUndefined();
    expect(getByPath(data, "address.zip")).toBeUndefined();
    expect(getByPath(data, "items[5].name")).toBeUndefined();
    expect(getByPath(data, "name.length")).toBeUndefined();
  });

  it("returns undefined when an intermediate value is null/undefined", () => {
    expect(getByPath(data, "empty.street")).toBeUndefined();
    expect(getByPath(data, "missing.street")).toBeUndefined();
    expect(getByPath(null, "a")).toBeUndefined();
    expect(getByPath(undefined, "a")).toBeUndefined();
  });

  it("does not resolve inherited properties", () => {
    expect(getByPath(data, "toString")).toBeUndefined();
    expect(getByPath(data, "address.constructor")).toBeUndefined();
  });

  it("returns undefined for empty paths and empty segments", () => {
    expect(getByPath(data, "")).toBeUndefined();
    expect(getByPath(data, "address..street")).toBeUndefined();
    expect(getByPath(data, ".name")).toBeUndefined();
  });

  it("reads through Vue reactive proxies", () => {
    expect(getByPath(reactive(data), "address.street")).toBe("Main");
  });
});

describe("hasPath", () => {
  it("finds top-level, nested and array paths", () => {
    expect(hasPath(data, "name")).toBe(true);
    expect(hasPath(data, "address.city")).toBe(true);
    expect(hasPath(data, "items[0].name")).toBe(true);
  });

  it("counts own keys holding null/undefined as present", () => {
    expect(hasPath(data, "empty")).toBe(true);
    expect(hasPath(data, "missing")).toBe(true);
  });

  it("rejects missing paths", () => {
    expect(hasPath(data, "someServerOnlyField")).toBe(false);
    expect(hasPath(data, "address.zip")).toBe(false);
    expect(hasPath(data, "items[2].name")).toBe(false);
    expect(hasPath(data, "empty.street")).toBe(false);
    expect(hasPath(data, "toString")).toBe(false);
    expect(hasPath(data, "")).toBe(false);
  });

  it("works on Vue reactive proxies", () => {
    const state = reactive(data);
    expect(hasPath(state, "address.street")).toBe(true);
    expect(hasPath(state, "address.zip")).toBe(false);
  });
});

describe("isPlainObject", () => {
  it("accepts plain objects, null-prototype objects and reactive proxies", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    expect(isPlainObject(reactive({ a: 1 }))).toBe(true);
  });

  it("rejects everything forms treat as a single value", () => {
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject("x")).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(new Blob())).toBe(false);
    expect(isPlainObject(new (class Foo {})())).toBe(false);
  });
});

describe("createFields", () => {
  const errors = new Map<string, string[]>();
  const fields = createFields({
    errors: (path) => errors.get(path) ?? [],
    isRequired: (path) => path === "name",
    setErrors: (path, messages) => errors.set(path, [messages].flat()),
    clearErrors: (path) => errors.delete(path),
  }) as EafFields<typeof data>;

  it("builds the path from property access, array indexes in brackets", () => {
    expect(fields.name.$path).toBe("name");
    expect(fields.address.street.$path).toBe("address.street");
    expect(fields.items[1].name.$path).toBe("items[1].name");
  });

  it("reads and changes the state of the field at its path", () => {
    fields.items[1].name.$setError("Taken");
    expect(errors.get("items[1].name")).toEqual(["Taken"]);
    expect(fields.items[1].name.$error).toBe("Taken");
    expect(fields.items[1].name.$errors).toEqual(["Taken"]);
    expect(fields.name.$required).toBe(true);
    expect(fields.address.$required).toBe(false);

    fields.items[1].name.$clearError();
    expect(fields.items[1].name.$error).toBeUndefined();
  });

  it("is not mistaken for a ref, reactive proxy or thenable", async () => {
    const field = fields.address;
    expect(isRef(field)).toBe(false);
    expect(isReactive(field)).toBe(false);
    expect(await Promise.resolve(field)).toBe(field);
    expect(String(field)).toBe("[object Object]");
  });
});
