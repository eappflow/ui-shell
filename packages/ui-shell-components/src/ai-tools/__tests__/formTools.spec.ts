import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { z } from "zod";
import { useEafForm } from "../../composables/useEafForm";
import { eafFormTools } from "../formTools";
import type { EafForm, EafFormConfig } from "../../types";

const orderSchema = z.object({
  name: z.string("Name is required"),
  quantity: z.number().min(1, "At least 1").optional(),
  deliverOn: z.date().nullable().optional(),
  address: z.object({ city: z.string().optional() }),
  items: z.array(z.object({ sku: z.string().optional() })),
});

type Order = z.input<typeof orderSchema>;

function mountForm({
  schema = orderSchema,
  exposeToAi,
}: {
  schema?: z.ZodType<unknown, Order>;
  exposeToAi?: EafFormConfig<Order>["exposeToAi"];
} = {}) {
  let form!: EafForm<Order>;
  const wrapper = mount({
    setup() {
      form = useEafForm({
        defaultValues: {
          name: "",
          quantity: 1,
          deliverOn: new Date("2026-01-01"),
          address: { city: "" },
          items: [{ sku: "A-1" }],
        },
        schema,
        exposeToAi,
      });
      return () => null;
    },
  });
  return { form, wrapper };
}

function tool(name: string) {
  const found = eafFormTools().find((t) => t.name === name);
  if (!found) throw new Error(`no ${name} tool`);
  return found;
}

type Described = {
  form: number;
  description?: string;
  descriptions?: Record<string, string>;
  fields: { path: string; value: unknown; required?: boolean }[];
  errors?: Record<string, string[]>;
  notFilled?: Record<string, string>;
};

describe("eafFormTools", () => {
  it("lists the mounted forms' fields, and nothing once they unmount", () => {
    const { wrapper } = mountForm();

    const [described] = tool("get_forms").run({}) as Described[];
    expect(described.fields).toEqual([
      { path: "name", value: "", required: true },
      { path: "quantity", value: 1 },
      { path: "deliverOn", value: new Date("2026-01-01") },
      { path: "address.city", value: "" },
      { path: "items[0].sku", value: "A-1" },
    ]);

    wrapper.unmount();
    expect(eafFormTools()).toEqual([]);
  });

  it("tells the model what the form and its fields are for, when given", () => {
    const { wrapper } = mountForm({
      exposeToAi: {
        $description: "Orders to ship",
        address: { city: "Where it goes" },
        items: {
          $description: "One per product",
          $each: { sku: "From the catalogue" },
        },
      },
    });
    const [described] = tool("get_forms").run({}) as Described[];

    expect(described?.description).toBe("Orders to ship");
    expect(described?.descriptions).toEqual({
      "address.city": "Where it goes",
      items: "One per product",
      "items[].sku": "From the catalogue",
    });
    wrapper.unmount();
  });

  it("leaves out forms created with exposeToAi: false", () => {
    const { wrapper } = mountForm({ exposeToAi: false });
    expect(eafFormTools()).toEqual([]);
    wrapper.unmount();
  });

  it("fills fields by path and reports what it could not fill", () => {
    const { form, wrapper } = mountForm();
    const [{ form: number }] = tool("get_forms").run({}) as Described[];

    const result = tool("fill_form").run({
      form: number,
      values: {
        name: "Anna",
        "address.city": "Kraków",
        "items[0].sku": "B-2",
        deliverOn: "2026-03-04",
        quantity: "many",
        nickname: "Ann",
      },
    }) as Described;

    expect(form.data.name).toBe("Anna");
    expect(form.data.address.city).toBe("Kraków");
    expect(form.data.items[0]?.sku).toBe("B-2");
    expect(form.data.deliverOn).toEqual(new Date("2026-03-04"));
    expect(form.data.quantity).toBe(1);
    expect(result.notFilled).toEqual({
      quantity: "quantity: Invalid input: expected number, received string",
      nickname: "There is no such field.",
    });
    wrapper.unmount();
  });

  it("takes a whole array, but not values of a type the schema doesn't take", () => {
    const { form, wrapper } = mountForm();
    const [{ form: number }] = tool("get_forms").run({}) as Described[];
    const fill = tool("fill_form");

    fill.run({
      form: number,
      values: { items: [{ sku: "A-1" }, { sku: "B-2" }] },
    });
    expect(form.data.items).toEqual([{ sku: "A-1" }, { sku: "B-2" }]);

    const result = fill.run({
      form: number,
      values: { items: [{ sku: "C-3" }, { sku: 5 }], address: { city: 5 } },
    }) as Described;
    expect(form.data.items).toEqual([{ sku: "A-1" }, { sku: "B-2" }]);
    expect(result.notFilled).toEqual({
      items: "items[1].sku: Invalid input: expected string, received number",
      address: "address.city: Invalid input: expected string, received number",
    });
    wrapper.unmount();
  });

  it("checks the new array items too, and drops the errors of removed ones", () => {
    const { wrapper } = mountForm({
      schema: orderSchema.extend({
        items: z.array(z.object({ sku: z.string("No SKU") })),
      }),
    });
    const [{ form: number }] = tool("get_forms").run({}) as Described[];
    const fill = tool("fill_form");

    const added = fill.run({
      form: number,
      values: { items: [{ sku: "A-1" }, { sku: "" }, { sku: "" }] },
    }) as Described;
    expect(added.errors).toEqual({
      "items[1].sku": ["No SKU"],
      "items[2].sku": ["No SKU"],
    });

    const trimmed = fill.run({
      form: number,
      values: { items: [{ sku: "A-1" }] },
    }) as Described;
    expect(trimmed.errors).toBeUndefined();
    wrapper.unmount();
  });

  it("returns the validation errors the new values cause", () => {
    const { wrapper } = mountForm();
    const [{ form: number }] = tool("get_forms").run({}) as Described[];

    const result = tool("fill_form").run({
      form: number,
      values: { quantity: 0 },
    }) as Described;

    expect(result.errors).toEqual({ quantity: ["At least 1"] });
    wrapper.unmount();
  });

  it("throws for a form that is gone and for values that are not an object", () => {
    const { wrapper } = mountForm();
    const [{ form: number }] = tool("get_forms").run({}) as Described[];
    const fill = tool("fill_form");
    wrapper.unmount();

    expect(() => fill.run({ form: number, values: {} })).toThrow(
      `There is no form ${number}`,
    );
    expect(
      fill.parameters!.safeParse({ form: number, values: "name=Anna" }).success,
    ).toBe(false);
  });
});
