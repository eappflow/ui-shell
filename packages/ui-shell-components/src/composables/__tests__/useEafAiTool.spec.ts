import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { useEafForm } from "../useEafForm";
import { eafScreenTools, useEafAiTool } from "../useEafAiTool";
import type { EafAiTool } from "../../types";

const findOrder: EafAiTool = {
  name: "find_order",
  description: "Finds an order.",
  run: () => null,
};

describe("eafScreenTools", () => {
  it("offers a component's tools next to the forms' while it is mounted", () => {
    const wrapper = mount({
      setup() {
        useEafForm({ defaultValues: { name: "" } });
        useEafAiTool(findOrder);
        return () => null;
      },
    });
    const names = () => eafScreenTools().map((tool) => tool.name);

    expect(names()).toEqual(["get_forms", "fill_form", "find_order"]);
    wrapper.unmount();
    expect(names()).toEqual([]);
  });

  it("points outside a component to the app's tools", () => {
    expect(() => useEafAiTool(findOrder)).toThrow("aiTools");
  });
});
