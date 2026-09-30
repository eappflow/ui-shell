import { describe, it, expect } from "vitest";
import { defineComponent, nextTick, type Component } from "vue";
import { mount } from "@vue/test-utils";
import PrimeVue from "primevue/config";
import IconField from "primevue/iconfield";
import InputText from "primevue/inputtext";
import EafFormItem from "../EafFormItem.vue";
import NestedFormFixture from "./NestedFormFixture.vue";
import { useEafForm } from "../../composables/useEafForm";
import type { EafForm, EafRules } from "../../types";

interface TestForm {
  firstName: string;
  address: { street: string; city: string };
}

const rules: EafRules<TestForm> = {
  firstName: { $required: true },
  address: {
    street: { $required: { message: "Street is required" } },
  },
};

function mountForm(
  template: string,
  options: { components?: Record<string, Component> } = {},
) {
  let form!: EafForm<TestForm>;
  const Host = defineComponent({
    components: { EafFormItem, ...options.components },
    setup() {
      form = useEafForm<TestForm>({
        data: { firstName: "", address: { street: "", city: "" } },
        rules,
      });
      // Not `$f`: runtime-compiled templates don't expose `$`-prefixed
      // setup bindings (script-setup SFCs do)
      return { f: form };
    },
    template,
  });

  const wrapper = mount(Host, { global: { plugins: [PrimeVue] } });
  return { wrapper, form };
}

describe("EafFormItem", () => {
  it("uses the path for testid and label `for`, and gives it to the slot as `id`", () => {
    const { wrapper } = mountForm(`
      <EafFormItem :for="f.fields.address.street" label="Street" v-slot="{ id }">
        <input :id="id" />
      </EafFormItem>
    `);

    const item = wrapper.get('[data-testid="address.street"]');
    expect(item.get("label").attributes("for")).toBe("address.street");
    expect(item.get("input").attributes("id")).toBe("address.street");
    // Nothing is forced onto the slotted input
    expect(item.get("input").attributes("name")).toBeUndefined();
    // A prop, not a fallthrough attribute
    expect(item.attributes("for")).toBeUndefined();
  });

  it("takes a field from form.fields, which needs no :form", async () => {
    const { wrapper, form } = mountForm(`
      <EafFormItem :for="f.fields.address.street" label="Street">
        <input />
      </EafFormItem>
    `);

    form.validate();
    await nextTick();
    expect(wrapper.get('[data-testid="address.street-error"]').text()).toBe(
      "Street is required",
    );
  });

  it("shows the required asterisk from the rules", () => {
    const { wrapper } = mountForm(`
      <EafFormItem :for="f.fields.address.street" label="Street">
        <input />
      </EafFormItem>
      <EafFormItem :for="f.fields.address.city" label="City">
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
      <EafFormItem :for="f.fields.address.street">
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

    form.data.address.street = "Main";
    form.validate();
    await nextTick();

    expect(wrapper.find('[data-testid="address.street-error"]').exists()).toBe(
      false,
    );
  });

  it("marks PrimeVue inputs invalid at any depth, e.g. inside an IconField", async () => {
    const { wrapper, form } = mountForm(
      `
      <EafFormItem :for="f.fields.address.street">
        <IconField>
          <InputText v-model="f.data.address.street" />
        </IconField>
      </EafFormItem>
    `,
      { components: { IconField, InputText } },
    );
    const input = () => wrapper.get("input");
    expect(input().classes()).not.toContain("p-invalid");

    form.validate();
    await nextTick();
    expect(input().classes()).toContain("p-invalid");
    expect(input().attributes("aria-invalid")).toBe("true");

    await input().setValue("Main");
    expect(input().classes()).not.toContain("p-invalid");
  });

  it("shows only the first error by default", async () => {
    const { wrapper, form } = mountForm(`
      <EafFormItem :for="f.fields.firstName"><input /></EafFormItem>
    `);

    form.fields.firstName.$setError(["First", "Second"]);
    await nextTick();

    expect(wrapper.get('[data-testid="firstName-error"]').text()).toBe("First");
  });
});

describe("EafFormItem in a script-setup SFC", () => {
  it('renders nested paths passed as for="address.street"', async () => {
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
  });
});
