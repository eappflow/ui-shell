import { describe, it, expect } from "vitest";
import { defineComponent, nextTick } from "vue";
import { mount } from "@vue/test-utils";
import EafFormItem from "../EafFormItem.vue";
import NestedFormFixture from "./NestedFormFixture.vue";
import { useEafForm } from "../../composables/useEafForm";
import type { EafForm, EafRules } from "../../types";

interface TestForm {
  firstName: string;
  address: { street: string; city: string };
}

const rules: EafRules<TestForm> = {
  firstName: { required: true },
  address: {
    street: { required: { message: "Street is required" } },
  },
};

function mountForm(
  template: string,
  options: { showAllErrors?: boolean } = {},
) {
  let form!: EafForm<TestForm>;
  const Host = defineComponent({
    components: { EafFormItem },
    setup() {
      form = useEafForm<TestForm>({
        data: { firstName: "", address: { street: "", city: "" } },
        rules,
        showAllErrors: options.showAllErrors,
      });
      // Not `$f`: runtime-compiled templates don't expose `$`-prefixed
      // setup bindings (script-setup SFCs do)
      return { f: form };
    },
    template,
  });

  const wrapper = mount(Host);
  return { wrapper, form };
}

describe("EafFormItem with a field handle (:field)", () => {
  it("derives testid, label `for` and input `name` from a flat field's path", () => {
    const { wrapper } = mountForm(`
      <EafFormItem :field="f.fields.firstName" label="First name">
        <input />
      </EafFormItem>
    `);

    const item = wrapper.get('[data-testid="firstName"]');
    expect(item.get("label").attributes("for")).toBe("firstName");
    expect(item.get("input").attributes("name")).toBe("firstName");
    // The handle is a prop, not a fallthrough attribute
    expect(item.attributes("field")).toBeUndefined();
  });

  it("uses the dot path for nested fields", () => {
    const { wrapper } = mountForm(`
      <EafFormItem :field="f.fields.address.street" label="Street">
        <input />
      </EafFormItem>
    `);

    const item = wrapper.get('[data-testid="address.street"]');
    expect(item.get("label").attributes("for")).toBe("address.street");
    expect(item.get("input").attributes("name")).toBe("address.street");
  });

  it("shows the required asterisk from the rules", () => {
    const { wrapper } = mountForm(`
      <EafFormItem :field="f.fields.address.street" label="Street">
        <input />
      </EafFormItem>
      <EafFormItem :field="f.fields.address.city" label="City">
        <input />
      </EafFormItem>
    `);

    expect(
      wrapper.get('[data-testid="address.street"] label span').text(),
    ).toBe("*");
    expect(
      wrapper.find('[data-testid="address.city"] label span').exists(),
    ).toBe(false);
  });

  it("reactively shows the field's error after validate()", async () => {
    const { wrapper, form } = mountForm(`
      <EafFormItem :field="f.fields.address.street">
        <input />
      </EafFormItem>
    `);
    expect(wrapper.find('[data-testid="address.street-error"]').exists()).toBe(
      false,
    );

    form.validate();
    await nextTick();

    expect(wrapper.get('[data-testid="address.street-error"]').text()).toBe(
      "Street is required",
    );
    expect(wrapper.get("input").classes()).toContain("p-invalid");

    form.data.address.street = "Main";
    form.validate();
    await nextTick();

    expect(wrapper.find('[data-testid="address.street-error"]').exists()).toBe(
      false,
    );
  });

  it("shows only the first error by default", async () => {
    const { wrapper, form } = mountForm(`
      <EafFormItem :field="f.fields.firstName"><input /></EafFormItem>
    `);

    form.setFieldError("firstName", ["First", "Second"]);
    await nextTick();

    expect(wrapper.get('[data-testid="firstName-error"]').text()).toBe("First");
  });

  it("shows every error, one per line, when the form uses showAllErrors", async () => {
    const { wrapper, form } = mountForm(
      `<EafFormItem :field="f.fields.firstName"><input /></EafFormItem>`,
      { showAllErrors: true },
    );

    form.setFieldError("firstName", ["First", "Second"]);
    await nextTick();

    const lines = wrapper
      .findAll('[data-testid="firstName-error"] span')
      .map((line) => line.text());
    expect(lines).toEqual(["First", "Second"]);
  });
});

describe("EafFormItem in a script-setup SFC", () => {
  it('renders nested handles passed as :field="$f.fields..."', async () => {
    const wrapper = mount(NestedFormFixture);
    const form = (wrapper.vm as unknown as { form: EafForm<unknown> }).form;

    expect(
      wrapper.get('[data-testid="address.street"] label span').text(),
    ).toBe("*");

    form.validate();
    await nextTick();

    expect(wrapper.get('[data-testid="name-error"]').text()).toBe(
      "This field is required",
    );
    expect(wrapper.get('[data-testid="address.street-error"]').text()).toBe(
      "This field is required",
    );
    expect(
      wrapper.get('[data-testid="address.street"] input').attributes("name"),
    ).toBe("address.street");
  });
});
