import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "../types";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => user.value !== null);

  async function login(email: string, _password: string) {
    // Mock login — replace with real auth provider
    user.value = {
      id: "1",
      name: "Demo User",
      email,
      role: "admin",
    };
  }

  function logout() {
    user.value = null;
  }

  return { user, isAuthenticated, login, logout };
});