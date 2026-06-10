import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import PrimeVue from "primevue/config";
import App from "./App.vue";
import { createNavigationGuards } from "@eappflow/ui-shell";

const app = createApp(App);
const pinia = createPinia();
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: () => import("./pages/Dashboard.vue"),
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("./pages/Settings.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("./pages/Login.vue"),
      meta: { public: true },
    },
  ],
});

app.use(pinia);
app.use(router);
createNavigationGuards(router);
app.use(PrimeVue);
app.mount("#app");