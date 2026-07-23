import { describe, it, expect } from "vitest";
import { defineComponent, reactive } from "vue";
import { mount } from "@vue/test-utils";
import EafFormValidationSummary from "../EafFormValidationSummary.vue";
import EafFormItem from "../EafFormItem.vue";
import { useEafForm, EAF_FORM_KEY } from "../../composables/useEafForm";
import type { ApiParsedErrorResponse, EafFormApiErrorParser } from "../../types";

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
        data: reactive({ firstName: "" }),
      });
      form.handleApiError(backendError);
      return { form };
    },
    template: `
      <EafFormValidationSummary :form="form" />
      <EafFormItem for="firstName" :form="form">
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
  it("shows a registered field's error next to the field, not in the summary", () => {
    const wrapper = mountFormWithBackendError({
      status: 422,
      success: false,
      validationErrors: {
        firstName: ["First name is already taken"],
      },
    });

    expect(wrapper.get('[data-testid="firstName-error"]').text()).toBe(
      "First name is already taken",
    );
    expect(wrapper.find('[data-testid="form-validation-summary"]').exists()).toBe(
      false,
    );
  });

  it("shows an unregistered field's error in the summary, not next to any field", () => {
    const wrapper = mountFormWithBackendError({
      status: 422,
      success: false,
      validationErrors: {
        someServerOnlyField: ["Some business rule was violated"],
      },
    });

    expect(wrapper.get('[data-testid="form-validation-summary"]').text()).toContain(
      "someServerOnlyField: Some business rule was violated",
    );
    expect(wrapper.find('[data-testid="firstName-error"]').exists()).toBe(false);
  });

  it("shows the general message in the summary banner", () => {
    const wrapper = mountFormWithBackendError({
      status: 422,
      success: false,
      generalMessage: "Please fix the errors below",
    });

    expect(wrapper.get('[data-testid="form-validation-summary"]').text()).toContain(
      "Please fix the errors below",
    );
  });

  it("shows nothing when the backend reports no error", () => {
    const wrapper = mountFormWithBackendError({
      status: 200,
      success: true,
    });

    expect(wrapper.find('[data-testid="form-validation-summary"]').exists()).toBe(
      false,
    );
    expect(wrapper.find('[data-testid="firstName-error"]').exists()).toBe(false);
  });
});
