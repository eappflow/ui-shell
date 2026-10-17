import { describe, it, expect } from "vitest";
import { defineComponent, nextTick, reactive, ref } from "vue";
import { mount } from "@vue/test-utils";
import EafFormValidationSummary from "../EafFormValidationSummary.vue";
import EafFormItem from "../EafFormItem.vue";
import { useEafForm, EAF_FORM_KEY } from "../../composables/useEafForm";
import type {
  ApiParsedErrorResponse,
  EafFormApiErrorParser,
} from "../../types";

interface TestForm {
  firstName: string;
}

// Identity parser - lets the test control exactly what "the backend returned"
// without depending on any particular HTTP client shape.
const identityParser: EafFormApiErrorParser = (error) =>
  error as ApiParsedErrorResponse;

function mountFormWithBackendError(backendError: ApiParsedErrorResponse) {
  const Host = defineComponent({
    components: { EafFormValidationSummary, EafFormItem },
    setup() {
      const form = useEafForm<TestForm>({
        defaultValues: reactive({ firstName: "" }),
      });
      form.handleApiError(backendError);
      return { form };
    },
    template: `
      <EafFormValidationSummary :form="form" />
      <EafFormItem :field="form.fields.firstName">
        <input />
      </EafFormItem>
    `,
  });

  return mount(Host, {
    global: {
      provide: { [EAF_FORM_KEY]: identityParser },
    },
  });
}

describe("backend errors parsed via EAF_FORM_KEY are displayed", () => {
  it("shows a registered field's error next to the field, not in the summary", async () => {
    const wrapper = mountFormWithBackendError({
      status: 422,
      success: false,
      validationErrors: {
        firstName: ["First name is already taken"],
      },
    });
    // The summary above renders before the item registers its field
    await nextTick();

    expect(wrapper.get('[data-testid="firstName-error"]').text()).toBe(
      "First name is already taken",
    );
    expect(
      wrapper.find('[data-testid="form-validation-summary"]').exists(),
    ).toBe(false);
  });

  it("shows an unregistered field's error in the summary, not next to any field", () => {
    const wrapper = mountFormWithBackendError({
      status: 422,
      success: false,
      validationErrors: {
        someServerOnlyField: ["Some business rule was violated"],
      },
    });

    expect(
      wrapper.get('[data-testid="form-validation-summary"]').text(),
    ).toContain("someServerOnlyField: Some business rule was violated");
    expect(wrapper.find('[data-testid="firstName-error"]').exists()).toBe(
      false,
    );
  });

  it("shows the general message in the summary banner", () => {
    const wrapper = mountFormWithBackendError({
      status: 422,
      success: false,
      generalMessage: "Please fix the errors below",
    });

    expect(
      wrapper.get('[data-testid="form-validation-summary"]').text(),
    ).toContain("Please fix the errors below");
  });

  it("shows nothing when the backend reports no error", () => {
    const wrapper = mountFormWithBackendError({
      status: 200,
      success: true,
      handleErrors: false,
    });

    expect(
      wrapper.find('[data-testid="form-validation-summary"]').exists(),
    ).toBe(false);
    expect(wrapper.find('[data-testid="firstName-error"]').exists()).toBe(
      false,
    );
  });
});

describe("errors of fields no EafFormItem shows", () => {
  function mountWithHiddenFields() {
    const Host = defineComponent({
      components: { EafFormValidationSummary, EafFormItem },
      setup() {
        // The id is held without an input; the note's input can be hidden
        const form = useEafForm({
          defaultValues: reactive({ id: "1", note: "" }),
        });
        const noteShown = ref(true);
        return { form, noteShown };
      },
      template: `
        <EafFormValidationSummary :form="form" />
        <EafFormItem v-if="noteShown" :field="form.fields.note">
          <input />
        </EafFormItem>
      `,
    });
    return mount(Host, {
      global: { provide: { [EAF_FORM_KEY]: identityParser } },
    });
  }

  it("shows a field's error in the summary while no EafFormItem shows the field", async () => {
    const wrapper = mountWithHiddenFields();
    const { form } = wrapper.vm as unknown as {
      form: ReturnType<typeof useEafForm<{ id: string; note: string }>>;
      noteShown: boolean;
    };
    form.handleApiError({
      status: 422,
      success: false,
      validationErrors: { id: ["Not found"], note: ["Too long"] },
    });
    await nextTick();

    const summary = () =>
      wrapper.get('[data-testid="form-validation-summary"]').text();
    expect(form.fields.id.$error).toBe("Not found");
    expect(summary()).toContain("id: Not found");
    expect(summary()).not.toContain("Too long");
    expect(wrapper.get('[data-testid="note-error"]').text()).toBe("Too long");

    (wrapper.vm as unknown as { noteShown: boolean }).noteShown = false;
    await nextTick();
    expect(summary()).toContain("note: Too long");
  });
});
