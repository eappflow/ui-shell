import type { App } from "vue";
import EafButton from "./components/EafButton.vue";
import EafModal from "./components/EafModal.vue";
import EafForm from "./components/EafForm.vue";
import EafInput from "./components/EafInput.vue";

export { EafButton, EafModal, EafForm, EafInput };

export default {
  install(app: App) {
    app.component("EafButton", EafButton);
    app.component("EafModal", EafModal);
    app.component("EafForm", EafForm);
    app.component("EafInput", EafInput);
  },
};